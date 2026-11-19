"""Independent reference for the CapDeploy pocket calculator.

Rebuilds the monthly cash flows from the spec (down payment + 4% DLD at month 0,
equal construction instalments in months 1..M-1, handover payment and sale at
month M) and solves the monthly IRR with Newton's method (different from the
site's bisection), then annualises it. Run: python3 tests/capdeploy_reference.py
"""
import json

def flows(P, down, during, M, g):
    hand = max(0, 100 - down - during)
    cf = [0.0] * (M + 1)
    cf[0] -= P * down / 100 + P * 0.04
    for m in range(1, M):
        cf[m] -= P * during / 100 / (M - 1)
    cf[M] += -P * hand / 100 + P * (1 + g / 100) ** (M / 12)
    return cf

def irr_annual(cf):
    r = 0.01
    for _ in range(100):
        f = sum(c / (1 + r) ** t for t, c in enumerate(cf))
        d = sum(-t * c / (1 + r) ** (t + 1) for t, c in enumerate(cf))
        r -= f / d
    return (1 + r) ** 12 - 1

CASES = [[1800000, 20, 40, 36, 6], [500000, 5, 70, 12, -5], [5000000, 40, 0, 60, 15], [2500000, 10, 50, 24, 3]]
out = []
for c in CASES:
    cf = flows(*c)
    cum, peak = 0, 0
    for x in cf:
        cum += x; peak = min(peak, cum)
    out.append({"case": c, "irr": irr_annual(cf), "peak": peak, "profit": sum(cf)})
print(json.dumps(out, indent=1))
