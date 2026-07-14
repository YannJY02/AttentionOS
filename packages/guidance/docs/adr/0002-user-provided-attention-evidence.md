---
status: accepted
date: 2026-07-14
---

# ADR 0002: Attention evidence is user-provided

## Context

The current desktop build has no passive sensing, application monitoring, or
active attention-test implementation. Earlier names such as `probe` and
`behavioralScore`, plus built-in example hierarchy records, could make manual
inputs and demonstrations look like measured production evidence.

## Decision

Attention estimates and outcome metrics use only explicit user-provided
calibration observations. Manually entered reaction-time and inhibition values
are `ReportedPerformanceSignal` data, not a system-run probe. Built-in workflow
examples remain available for orientation but are marked and excluded from
learning and release metrics. Guidance returns platform-neutral no-data states;
the desktop UI owns calibration calls to action.

Synthetic attention observations remain limited to tests or explicitly marked
development fixtures. Passive sensing is separate future work and must define
its own consent, provenance, and platform boundaries before implementation.

## Consequences

A fresh production profile reports no attention or plan-fulfillment percentage
until the user supplies evidence. Stored manual records retain compatibility
through a one-way vocabulary migration. Product copy can no longer imply that
AttentionOS monitored applications or ran a probe when it only received typed
values.

Tracked by [GitHub issue #21](https://github.com/YannJY02/AttentionOS/issues/21).
