---
title: Matrix
description: 2D traversals, boundary shrinking and the off-by-one traps that break matrix solutions.
section: dsa
order: 3
tags: [matrix, 2d, traversal, boundaries]
updated: 2026-10-25
---

Matrix problems are usually about maintaining boundaries instead of copying data. This note collects
the traversal patterns I want to be able to reproduce without thinking.

## Spiral Order

Walk the outer ring clockwise — left→right along the top, top→bottom along the right, right→left
along the bottom, bottom→top along the left — then shrink the four boundaries and repeat on the
inner ring.

```cpp
class Solution {
public:
    vector<int> spiralOrder(vector<vector<int>>& matrix) {
        int m = matrix.size();
        int n = matrix[0].size();
        int left = 0, top = 0, right = n - 1, bottom = m - 1;
        vector<int> ans;

        while (top <= bottom && left <= right) {
            for (int i = left; i <= right; i++) {
                ans.push_back(matrix[top][i]);
            }
            top++;

            for (int i = top; i <= bottom; i++) {
                ans.push_back(matrix[i][right]);
            }
            right--;

            if (top <= bottom) {
                for (int i = right; i >= left; i--) {
                    ans.push_back(matrix[bottom][i]);
                }
                bottom--;
            }

            if (left <= right) {
                for (int i = bottom; i >= top; i--) {
                    ans.push_back(matrix[i][left]);
                }
                left++;
            }
        }

        return ans;
    }
};
```

| Time | Space (extra) | Space (with output) |
| --- | --- | --- |
| O(m·n) | O(1) | O(m·n) |

**Why the two `if` checks are required**

The four loops assume a full ring, but the last layer can collapse into a single row or a single
column. Without the guards, the later loops would revisit cells that the earlier loops already
emitted:

- `if (top <= bottom)` guards the **bottom row** loop. After `top++`, a one-row layer leaves
  `top == bottom + 1`, and that row was already emitted left→right by the first loop. Running the
  right→left loop would append it a second time. This is exactly the `1 × n` case.
- `if (left <= right)` guards the **left column** loop. After `right--`, a one-column layer leaves
  `left == right + 1`, and that column was already emitted top→bottom by the second loop. Running the
  bottom→top loop would duplicate it — the `m × 1` case.

The `while (top <= bottom && left <= right)` condition stops the whole traversal once the boundaries
cross, but it is only evaluated at the **start** of each ring. The inner loops run after `top` and
`right` have already moved, so the loop condition cannot protect them.

Concrete example: `[[1, 2, 3]]` (1 × 3). The top row is emitted as `1, 2, 3`; `top` becomes `1`. The
bottom-row loop would then run with `bottom = 0` and `top = 1`, and without the guard it would append
`3, 2, 1` again. With the guard it is skipped and the answer stays `[1, 2, 3]`.

**Interview notes**

- The four boundary updates must happen **after** their loop: `top++`, `right--`, `bottom--`,
  `left++`. Moving them earlier skips rows or columns.
- `m` and `n` are separate — the matrix need not be square. Using one size for both is the classic
  bug on rectangular input.
- `matrix[0].size()` is undefined for an empty matrix. LeetCode guarantees a non-empty matrix; in
  general, guard with `if (matrix.empty() || matrix[0].empty()) return {};`.
- Every cell is pushed exactly once, so the time is O(m·n). The only extra memory is the four
  boundaries; the output itself is O(m·n).
- An alternative is a `visited` grid plus direction vectors (`right, down, left, up`), which is
  easier to reason about but costs O(m·n) extra space.
- "Spiral Matrix II" (fill `1..m·n` into a spiral) uses the same skeleton — replace
  `ans.push_back(...)` with `matrix[top][i] = next++`.
- The traversal is clockwise starting at the top-left corner; counter-clockwise is the same code
  with the loop order reversed.
