#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

const ledgerPath = new URL(
  '../docs/plans/2026-05-23-attentionos-release-candidate-requirements-ledger.md',
  import.meta.url,
);
const ownerDecisionPacketPath = new URL(
  '../docs/plans/2026-05-24-attentionos-release-candidate-owner-decision-packet.md',
  import.meta.url,
);

const terminalStatuses = new Set([
  '已实现并验证',
  '经 owner 明确同意延期',
  '受外部依赖阻塞',
  '被更新的已接受项目决策取代',
]);
const executionStatuses = new Set([...terminalStatuses, 'Open']);
const completionMode = process.argv.includes('--complete');

function splitMarkdownRow(line) {
  return line
    .trim()
    .slice(1, -1)
    .split('|')
    .map((cell) => cell.trim());
}

function parseCoverageRows(ledger) {
  const lines = ledger.split('\n');
  const rows = [];
  let inMatrix = false;

  for (const line of lines) {
    if (line.startsWith('## Coverage Matrix')) {
      inMatrix = true;
      continue;
    }

    if (inMatrix && line.startsWith('## ')) {
      break;
    }

    if (!inMatrix || !line.startsWith('| RC-')) {
      continue;
    }

    const [id, requirement, source, currentEvidence, status, nextWork] = splitMarkdownRow(line);
    rows.push({ currentEvidence, id, nextWork, requirement, source, status });
  }

  return rows;
}

function fail(message, details = []) {
  console.error(`Release-candidate ledger check failed: ${message}`);
  for (const detail of details) {
    console.error(`- ${detail}`);
  }
  process.exitCode = 1;
}

const [ledger, ownerDecisionPacket] = await Promise.all([
  readFile(ledgerPath, 'utf8'),
  readFile(ownerDecisionPacketPath, 'utf8'),
]);

const rows = parseCoverageRows(ledger);

if (rows.length === 0) {
  fail('no RC coverage rows were parsed');
} else {
  const invalidStatusRows = rows.filter((row) => !executionStatuses.has(row.status));
  const duplicateIds = rows
    .map((row) => row.id)
    .filter((id, index, ids) => ids.indexOf(id) !== index);
  const openRows = rows.filter((row) => row.status === 'Open');
  const externalRows = rows.filter((row) => row.status === '受外部依赖阻塞');
  const implementedRows = rows.filter((row) => row.status === '已实现并验证');
  const ownerDeferredRows = rows.filter((row) => row.status === '经 owner 明确同意延期');
  const replacedRows = rows.filter((row) => row.status === '被更新的已接受项目决策取代');
  const ownerPacketRows = ['RC-020', 'RC-042', 'RC-051', 'RC-056', 'RC-058', 'RC-059', 'RC-060'];
  const missingOwnerPacketRefs = ownerPacketRows.filter(
    (id) => !ledger.includes(id) || !ownerDecisionPacket.includes(id),
  );

  if (invalidStatusRows.length > 0) {
    fail(
      'unknown status values found',
      invalidStatusRows.map((row) => `${row.id}: ${row.status}`),
    );
  }

  if (duplicateIds.length > 0) {
    fail('duplicate RC ids found', [...new Set(duplicateIds)]);
  }

  if (missingOwnerPacketRefs.length > 0) {
    fail(
      'owner decision packet does not cover every expected owner-controlled row',
      missingOwnerPacketRefs,
    );
  }

  if (completionMode && openRows.length > 0) {
    fail(
      '--complete mode requires all rows to be terminal',
      openRows.map((row) => `${row.id}: ${row.requirement}`),
    );
  }

  if (!process.exitCode) {
    console.log('Release-candidate ledger check passed.');
    console.log(
      JSON.stringify(
        {
          complete: openRows.length === 0,
          completionMode,
          counts: {
            externalBlocked: externalRows.length,
            implemented: implementedRows.length,
            open: openRows.length,
            ownerDeferred: ownerDeferredRows.length,
            replaced: replacedRows.length,
            total: rows.length,
          },
          openRows: openRows.map((row) => row.id),
          externalRows: externalRows.map((row) => row.id),
        },
        null,
        2,
      ),
    );
  }
}
