# Project continuity

Before continuing maintenance, read PROJECT_HANDOFF.md and check git status/history. It records the September 8, 2026 changes, validation, price API blocker and next work.

Local audit-site-2026-09-08/IMPLEMENTED.md has additional private account context when available. Preserve audit-site-2026-09-08/ and audit-homepage/; do not bulk-stage their contents. Audit insertion scripts may not be idempotent.

Treat recorded prices, stock, rankings and deployment results as historical observations. Verify current state before making current claims. Never update price-check dates without a real price check or transfer benchmark results between different retail configurations.
