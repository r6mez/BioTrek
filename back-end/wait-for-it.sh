#!/usr/bin/env bash
# Minimal wait-for-it implementation: wait for host:port, then exec command.
set -euo pipefail

usage() {
  echo "Usage: $0 host:port [-t timeout] -- command args" >&2
}

HOST=""
PORT=""
TIMEOUT=60
AFTER=("")

if [[ $# -lt 1 ]]; then
  usage; exit 1
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    -*t|--timeout)
      TIMEOUT="$2"; shift 2;;
    --)
      shift; AFTER=("$@"); break;;
    *)
      IFS=":" read -r HOST PORT <<< "$1"; shift;;
  esac
done

if [[ -z "${HOST}" || -z "${PORT}" ]]; then
  usage; exit 1
fi

echo "Waiting for ${HOST}:${PORT} up to ${TIMEOUT}s..."
end=$((SECONDS+TIMEOUT))
until bash -c "</dev/tcp/${HOST}/${PORT}" >/dev/null 2>&1; do
  if (( SECONDS >= end )); then
    echo "Timeout waiting for ${HOST}:${PORT}" >&2
    exit 1
  fi
  sleep 1
done
echo "${HOST}:${PORT} is available."

if [[ ${#AFTER[@]} -gt 0 && -n "${AFTER[0]}" ]]; then
  exec "${AFTER[@]}"
fi
