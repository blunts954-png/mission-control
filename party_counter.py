#!/usr/bin/env python3
"""Party Guest Counter - press Enter each time a guest arrives."""

import datetime
import sys

def main():
    count = 0
    log = []

    print("=" * 40)
    print("   PARTY GUEST COUNTER")
    print("=" * 40)
    print()
    print("  ENTER  = +1 guest")
    print("  u      = undo last")
    print("  s      = show log")
    print("  q      = quit & show summary")
    print()
    print("-" * 40)

    while True:
        try:
            cmd = input(f"\n  Guests so far: {count}  > ").strip().lower()
        except (EOFError, KeyboardInterrupt):
            break

        if cmd == "q":
            break
        elif cmd == "u":
            if log:
                log.pop()
                count -= 1
                print(f"  Undone. Count: {count}")
            else:
                print("  Nothing to undo.")
        elif cmd == "s":
            if log:
                print()
                for i, ts in enumerate(log, 1):
                    print(f"  Guest #{i:>4}  —  {ts}")
                print()
            else:
                print("  No guests yet.")
        else:
            count += 1
            ts = datetime.datetime.now().strftime("%H:%M:%S")
            log.append(ts)
            print(f"  +1 ! Total guests: {count}  (arrived {ts})")

    print()
    print("=" * 40)
    print(f"  FINAL COUNT: {count} guests")
    if log:
        print(f"  First arrival: {log[0]}")
        print(f"  Last arrival:  {log[-1]}")
    print("=" * 40)

if __name__ == "__main__":
    main()
