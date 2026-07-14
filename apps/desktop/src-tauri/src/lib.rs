use serde::Serialize;
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager};

const STATE_FILE_NAME: &str = "attentionos-state.json";
const RECOVERY_DIR_NAME: &str = "recovery";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AppStateWriteResult {
    path: String,
    bytes: usize,
    written_at_ms: u128,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct NativeQaReadyMarker {
    app_data_dir: String,
    label: String,
    written_at_ms: u128,
}

fn now_ms() -> Result<u128, String> {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .map_err(|error| format!("System clock error: {error}"))
}

fn app_state_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Unable to resolve app data directory: {error}"))?;
    fs::create_dir_all(&dir)
        .map_err(|error| format!("Unable to create app data directory: {error}"))?;
    Ok(dir)
}

fn app_state_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app_state_dir(app)?.join(STATE_FILE_NAME))
}

fn write_atomic(path: PathBuf, contents: &str) -> Result<AppStateWriteResult, String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|error| format!("Unable to create state file directory: {error}"))?;
    }

    let temp_path = path.with_extension("json.tmp");
    fs::write(&temp_path, contents)
        .map_err(|error| format!("Unable to write temporary state file: {error}"))?;
    fs::rename(&temp_path, &path)
        .map_err(|error| format!("Unable to replace state file atomically: {error}"))?;

    Ok(AppStateWriteResult {
        path: path.to_string_lossy().into_owned(),
        bytes: contents.len(),
        written_at_ms: now_ms()?,
    })
}

#[tauri::command]
fn read_app_state(app: AppHandle) -> Result<Option<String>, String> {
    let path = app_state_path(&app)?;

    if !path.exists() {
        return Ok(None);
    }

    fs::read_to_string(&path).map(Some).map_err(|error| {
        format!(
            "Unable to read app state from {}: {error}",
            path.to_string_lossy()
        )
    })
}

#[tauri::command]
fn write_app_state(app: AppHandle, snapshot: String) -> Result<AppStateWriteResult, String> {
    write_atomic(app_state_path(&app)?, &snapshot)
}

#[tauri::command]
fn quarantine_app_state(
    app: AppHandle,
    snapshot: Option<String>,
) -> Result<AppStateWriteResult, String> {
    let state_path = app_state_path(&app)?;
    let recovery_dir = app_state_dir(&app)?.join(RECOVERY_DIR_NAME);
    fs::create_dir_all(&recovery_dir)
        .map_err(|error| format!("Unable to create recovery directory: {error}"))?;

    let recovery_path = recovery_dir.join(format!("attentionos-corrupt-state-{}.json", now_ms()?));

    if state_path.exists() {
        let bytes = fs::metadata(&state_path)
            .map_err(|error| format!("Unable to inspect app state before quarantine: {error}"))?
            .len() as usize;
        fs::rename(&state_path, &recovery_path)
            .map_err(|error| format!("Unable to quarantine corrupt app state: {error}"))?;

        return Ok(AppStateWriteResult {
            path: recovery_path.to_string_lossy().into_owned(),
            bytes,
            written_at_ms: now_ms()?,
        });
    }

    let contents = snapshot.unwrap_or_default();
    write_atomic(recovery_path, &contents)
}

#[tauri::command]
fn export_app_state(app: AppHandle, snapshot: String) -> Result<AppStateWriteResult, String> {
    let backup_dir = app_state_dir(&app)?.join("backups");
    fs::create_dir_all(&backup_dir)
        .map_err(|error| format!("Unable to create backup directory: {error}"))?;

    let backup_path = backup_dir.join(format!("attentionos-backup-{}.json", now_ms()?));
    write_atomic(backup_path, &snapshot)
}

#[tauri::command]
fn save_app_state_export(app: AppHandle, snapshot: String) -> Result<AppStateWriteResult, String> {
    let export_dir = app_state_dir(&app)?.join("exports");
    fs::create_dir_all(&export_dir)
        .map_err(|error| format!("Unable to create export directory: {error}"))?;

    let export_path = export_dir.join(format!("attentionos-export-{}.json", now_ms()?));
    write_atomic(export_path, &snapshot)
}

#[tauri::command]
fn record_qa_ready(app: AppHandle, label: String) -> Result<Option<AppStateWriteResult>, String> {
    let marker_path = match std::env::var("ATTENTIONOS_QA_READY_FILE") {
        Ok(path) if !path.trim().is_empty() => PathBuf::from(path),
        _ => return Ok(None),
    };

    let app_data_dir = app_state_dir(&app)?;
    let written_at_ms = now_ms()?;
    let marker = NativeQaReadyMarker {
        app_data_dir: app_data_dir.to_string_lossy().into_owned(),
        label,
        written_at_ms,
    };
    let payload = serde_json::to_string_pretty(&marker)
        .map_err(|error| format!("Unable to serialize QA readiness marker: {error}"))?;

    write_atomic(marker_path, &payload).map(Some)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_app_state,
            write_app_state,
            quarantine_app_state,
            export_app_state,
            save_app_state_export,
            record_qa_ready
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
