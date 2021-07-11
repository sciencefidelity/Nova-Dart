#!/usr/bin/env bash
cd "$WORKSPACE_DIR"

dart \
"$INSTALL_DIR/analysis_server.dart.snapshot" \
--lsp
