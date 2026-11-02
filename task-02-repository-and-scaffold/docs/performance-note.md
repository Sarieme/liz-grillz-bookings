# Performance note

## What I measured
I started the server with `npm start`, from `task-02-repository-and-scaffold`, on port 3000. I timed the home page from PowerShell with `Measure-Command` and `Invoke-WebRequest`. The raw output is in `evidence/04-first-load.txt`.

| Request | Status | Time |
|---|---|---|
| First load | 200 | 164.56 ms |
| Reload | 200 | 31.60 ms |

Recorded on 01/11/2026 at 23:18 and 23:19.

## How far this is from a target
My target is a server response under 200 ms, because the page is one small file and nothing on it should need longer. Both of my measurements are under that.

## What accounts for the first-load gap
The 133 ms difference between first load and reload is a guess, not a measurement. I did not isolate these causes:
- The operating system reading the file from disk for the first time, then serving it from its cache on reload.
- The first connection to the server being set up.
- PowerShell's own overhead on its first web request in a session, which would make the first number look slower than the server really is.

## What I did not measure
- **What a person sees.** PowerShell measures the response arriving, not the browser parsing the page, loading styles and drawing it.
- **The server's own processing time.** The server does not log requests. It printed only its start-up line (`evidence/03-server-start.txt`), so I have no server-side record to compare against.
- **Anything over a real network.** Everything ran on my own laptop, so there is no network delay in these numbers.

## Why this result will not last
The server is a one-line Node script that reads a file and sends it back. It has no framework, no compile step and no database, which is why the gap is small. Once I add a real stack and a database, I expect the first load to get slower, and I will measure again and compare. I also noticed that the scaffold gives me no per-request logging, so the stack I choose needs to provide status codes and timings for the form investigation.