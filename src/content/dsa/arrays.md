---
title: Arrays
description: Interview problems with the code, the complexity and the two or three points that matter.
section: dsa
order: 2
tags: [arrays, two-pointers, traversal, matrix]
updated: 2026-10-27
---

## Second Largest Element

Return the second largest **distinct** value in `nums`, or `-1` when it does not exist.

```cpp
class Solution {
public:
    int secondLargestElement(vector<int>& nums) {
        long long maxEl = LLONG_MIN;
        long long secMaxEl = LLONG_MIN;

        for (int num : nums) {
            if (num > maxEl) {
                secMaxEl = maxEl;
                maxEl = num;
            }
            else if (num < maxEl && num > secMaxEl) {
                secMaxEl = num;
            }
        }

        return secMaxEl == LLONG_MIN ? -1 : secMaxEl;
    }
};
```

| Time | Space |
| --- | --- |
| O(n) | O(1) |

- `num < maxEl` keeps duplicates of the maximum out of second place.
- `LLONG_MIN` handles negative values; an all-equal array returns `-1`.
- One pass — sorting first would cost O(n log n).

## Max Consecutive Ones

Return the length of the longest run of `1`s.

```cpp
class Solution {
public:
    int findMaxConsecutiveOnes(vector<int>& nums) {
        int ans=0;
        int cnt=0;
        for(int i=0;i<nums.size();i++){
            if(nums[i]){
                cnt++;
            } else {
                cnt=0;
            }
            ans=max(ans,cnt);
        }
        return ans;
    }
};
```

| Time | Space |
| --- | --- |
| O(n) | O(1) |

- Reset `cnt` on `0` and update `ans` every iteration, so a run ending at the last element counts.
- `if (nums[i])` treats any non-zero value as `1`; compare with `== 1` if that matters.
- An empty array returns `0`.

## Rotate Array

Rotate `nums` by `k` steps in place. Left rotation reverses `[0, k)`, then `[k, n)`, then the whole
array; right rotation does the same in the opposite order.

```cpp tab="Left rotation"
class Solution {
public:
    void rotateArray(vector<int>& nums, int k) {
        int n = nums.size();
        if (n == 0) return;
        k %= n;
        reverse(nums.begin(), nums.begin() + k);
        reverse(nums.begin() + k, nums.end());
        reverse(nums.begin(), nums.end());
    }
};
```

```cpp tab="Right rotation"
class Solution {
public:
    void rotateArrayRight(vector<int>& nums, int k) {
        int n = nums.size();
        if (n == 0) return;
        k %= n;
        reverse(nums.begin(), nums.end());
        reverse(nums.begin(), nums.begin() + k);
        reverse(nums.begin() + k, nums.end());
    }
};
```

| Operation | Time | Space |
| --- | --- | --- |
| Left rotate | O(n) | O(1) |
| Right rotate | O(n) | O(1) |

- `if (n == 0) return;` must come before `k %= n`, otherwise an empty array divides by zero.
- `k %= n` handles `k > n`; `k == 0` leaves the array unchanged.
- Three reversals give O(n) time with O(1) auxiliary space.

## Move Zeroes

Move every `0` to the end while keeping the relative order of the other elements, in place.

```cpp
class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        int n = nums.size();
        int j=0;
        for(int i=0;i<n;i++){
            if(nums[i]!=0) {
                swap(nums[i],nums[j]);
                j++;
            }
        }
    }
};
```

| Time | Space |
| --- | --- |
| O(n) | O(1) |

- `j` is the write pointer; each swap moves a zero behind the non-zero just written, so order holds.
- One pass — every element is visited once and swapped at most once.
- `erase` inside a loop is O(n) per call, which makes the whole thing O(n²).

## Remove Duplicates from Sorted Array

Remove duplicates in place and return the number of unique values. The first `k` positions hold the
answer.

```cpp
class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        int n = nums.size();
        if (n == 0) return 0;
        int i = 0;
        for (int j = 1; j < n; j++) {
            if (nums[i] != nums[j]) {
                i++;
                nums[i] = nums[j];
            }
        }
        return i + 1;
    }
};
```

| Time | Space |
| --- | --- |
| O(n) | O(1) |

- The empty guard returns `0`; without it `i + 1` returns `1` for an empty input.
- Sorted input is required — duplicates are adjacent.
- `i` is the index of the last unique value, so the count is `i + 1`.

## Missing Number

`nums` holds `n` distinct values from `0..n`; return the missing one.

```cpp tab="XOR"
int missingNumber(vector<int>& nums) {
    int xor1 = 0, xor2 = 0;

    // XOR of 1..n and XOR of the array
    for (int i = 0; i < nums.size(); i++) {
        xor1 = xor1 ^ (i + 1);
        xor2 = xor2 ^ nums[i];
    }

    return (xor1 ^ xor2);
}
```

```cpp tab="Sum formula"
int missingNumber(vector<int>& nums) {
    int n = nums.size();
    int nSum = (n * (n + 1)) / 2;
    int numSum = accumulate(nums.begin(), nums.end(), 0);
    return nSum - numSum;
}
```

| Time | Space |
| --- | --- |
| O(n) | O(1) |

- XOR: equal values cancel and `0` contributes nothing, so `1..n` XOR the array leaves the answer.
- Sum: `n(n+1)/2 - sum`; use `long long`, because `n(n+1)` overflows `int` near `n = 46,341`.
- Both are O(n) / O(1); cyclic sort is another O(1)-space option for `0..n`.

## Union of Two Sorted Arrays

Return the sorted union of two sorted arrays, with duplicates removed.

```cpp
class Solution {
public:
    vector<int> unionArray(vector<int>& nums1, vector<int>& nums2) {
        vector<int> temp;
        int n1 = nums1.size();
        int n2 = nums2.size();
        int i = 0, j = 0;

        while (i < n1 && j < n2) {
            if (nums1[i] <= nums2[j]) {
                if (temp.empty() || temp.back() != nums1[i]) {
                    temp.push_back(nums1[i]);
                }
                i++;
            } else {
                if (temp.empty() || temp.back() != nums2[j]) {
                    temp.push_back(nums2[j]);
                }
                j++;
            }
        }

        while (i < n1) {
            if (temp.empty() || temp.back() != nums1[i]) {
                temp.push_back(nums1[i]);
            }
            i++;
        }

        while (j < n2) {
            if (temp.empty() || temp.back() != nums2[j]) {
                temp.push_back(nums2[j]);
            }
            j++;
        }

        return temp;
    }
};
```

| Time | Space |
| --- | --- |
| O(n + m) | O(n + m) |

- The tail loops need the `temp.empty()` guard too — with an empty input, `temp.back()` is undefined.
- `<=` keeps the merge stable, and the output is sorted because both inputs are.
- The O(n + m) output is unavoidable; for unsorted inputs, sort first or use a set.

## Intersection of Two Sorted Arrays

Return the intersection of two sorted arrays, preserving multiplicities.

```cpp
class Solution {
public:
    vector<int> intersectionArray(vector<int>& nums1, vector<int>& nums2) {
        int n1 = nums1.size();
        int n2 = nums2.size();
        vector<int> ans;

        int i = 0, j = 0;
        while (i < n1 && j < n2) {
            if (nums1[i] < nums2[j]) {
                i++;
            } else if (nums1[i] > nums2[j]) {
                j++;
            } else {
                ans.push_back(nums1[i]);
                i++;
                j++;
            }
        }

        return ans;
    }
};
```

| Time | Space |
| --- | --- |
| O(n + m) | O(min(n, m)) |

- Multiplicities are kept: `[1,1,2]` ∩ `[1,1,2]` = `[1,1,2]`. Add `ans.empty() || ans.back() != nums1[i]`
  for distinct values only.
- Advance only the smaller side — comparing every pair would be O(n·m).
- For unsorted inputs, count frequencies with an `unordered_map`.

## Majority Element

Return the value that appears more than `n/2` times, or `-1` when none does.

```cpp
class Solution {
public:
    int majorityElement(vector<int>& nums) {
        int c = 0;
        int cur = 0;

        for (auto it : nums) {
            if (c == 0) {
                cur = it;
                c++;
            } else if (cur == it) {
                c++;
            } else {
                c--;
            }
        }

        int cnt1 = 0;
        for (auto it : nums) {
            if (it == cur) cnt1++;
        }

        if (cnt1 > (nums.size() / 2)) return cur;
        return -1;
    }
};
```

| Time | Space |
| --- | --- |
| O(n) | O(1) |

- The verification pass is required: without it `[1,2,3]` returns `3`.
- `c` is a balance, not a count — pairs of different values cancel.
- The threshold is strict `> n/2`; an empty array returns `-1`.

### More than n/k

Return every value that appears more than `n/k` times.

```cpp
class Solution {
public:
    vector<int> majorityElements(vector<int>& nums, int k) {
        if (k < 2) return {};

        int n = nums.size();
        int slots = k - 1;
        vector<int> cand(slots, 0), cnt(slots, 0);

        for (int num : nums) {
            int matched = -1;
            for (int i = 0; i < slots; i++) {
                if (cnt[i] > 0 && cand[i] == num) { matched = i; break; }
            }
            if (matched != -1) { cnt[matched]++; continue; }

            int freeSlot = -1;
            for (int i = 0; i < slots; i++) {
                if (cnt[i] == 0) { freeSlot = i; break; }
            }
            if (freeSlot != -1) { cand[freeSlot] = num; cnt[freeSlot] = 1; continue; }

            for (int i = 0; i < slots; i++) cnt[i]--;
        }

        vector<int> ans;
        for (int i = 0; i < slots; i++) {
            if (cnt[i] == 0) continue;
            int total = count(nums.begin(), nums.end(), cand[i]);
            if (total > n / k && find(ans.begin(), ans.end(), cand[i]) == ans.end()) {
                ans.push_back(cand[i]);
            }
        }
        return ans;
    }
};
```

| Time | Space |
| --- | --- |
| O(n·k) | O(k) |

- At most `k - 1` answers can exist, which is why `k - 1` slots suffice; `k = 3` is the n/3 problem.
- Verify each survivor with `count(...) > n / k` — the slots only produce candidates.
- With fixed `k` (2 or 3) the loop over slots is constant, so the bound is O(n).

## Leaders in an Array

Return the leaders — elements greater than everything to their right — in their original order.

```cpp
class Solution {
public:
    vector<int> leaders(vector<int>& nums) {
        vector<int> ans;
        int n = nums.size();
        if (n == 0) return ans;

        int last_el = nums[n - 1];
        ans.push_back(last_el);

        for (int i = n - 2; i >= 0; i--) {
            if (nums[i] > last_el) {
                last_el = nums[i];
                ans.push_back(last_el);
            }
        }

        reverse(ans.begin(), ans.end());
        return ans;
    }
};
```

| Time | Space |
| --- | --- |
| O(n) | O(1) extra, O(n) with output |

- The rightmost element is always a leader; the scan tracks the suffix maximum.
- Strict `>` excludes duplicates of the maximum: `[5, 5]` → `[5]`.
- Results are collected right-to-left and reversed; guard the empty array before `nums[n-1]`.

## Rearrange Array by Sign

Put positives at even indices and negatives at odd indices, preserving the relative order of each
group. Equal counts are assumed.

```cpp
class Solution {
public:
    vector<int> rearrangeArray(vector<int>& nums) {
        int n = nums.size();
        vector<int> ans(n, 0);

        int posIndex = 0, negIndex = 1;

        for (int i = 0; i < n; i++) {
            if (nums[i] < 0) {
                ans[negIndex] = nums[i];
                negIndex += 2;
            } else {
                ans[posIndex] = nums[i];
                posIndex += 2;
            }
        }

        return ans;
    }
};
```

| Time | Space |
| --- | --- |
| O(n) | O(n) |

- `posIndex = 0`, `negIndex = 1`, both advancing by 2 — the interleaving is implicit.
- Equal counts are required; otherwise one index runs past `n - 1`.
- `nums[i] < 0` treats `0` as positive, and the O(n) output cannot be avoided.

## Spiral Matrix

Return every element of the matrix in clockwise spiral order.

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

| Time | Space |
| --- | --- |
| O(m·n) | O(1) extra, O(m·n) with output |

- `if (top <= bottom)` stops a single remaining row from being emitted twice (`1 × n` case).
- `if (left <= right)` does the same for a single remaining column (`m × 1` case).
- Update the boundaries after their loop, and keep `m` and `n` separate for rectangular matrices.

## Rotate Matrix

Rotate a square matrix 90° clockwise, in place: transpose across the main diagonal, then reverse
every row.

```cpp tab="90° clockwise"
class Solution {
public:
    void rotateMatrix(vector<vector<int>>& matrix) {
        int n = matrix.size();

        for (int i = 0; i < n; i++) {
            for (int j = 0; j < i; j++) {
                swap(matrix[i][j], matrix[j][i]);
            }
        }

        for (int i = 0; i < n; i++) {
            reverse(matrix[i].begin(), matrix[i].end());
        }
    }
};
```

```cpp tab="k × 90°"
class Solution {
public:
    void rotate90(vector<vector<int>>& matrix) {
        int n = matrix.size();

        for (int i = 0; i < n; i++) {
            for (int j = 0; j < i; j++) {
                swap(matrix[i][j], matrix[j][i]);
            }
        }

        for (int i = 0; i < n; i++) {
            reverse(matrix[i].begin(), matrix[i].end());
        }
    }

    // k > 0 rotates clockwise, k < 0 rotates counter-clockwise.
    void rotateMatrix(vector<vector<int>>& matrix, int k) {
        k = ((k % 4) + 4) % 4;

        for (int t = 0; t < k; t++) {
            rotate90(matrix);
        }
    }
};
```

| Operation | Time | Space |
| --- | --- | --- |
| 90° | O(n²) | O(1) |
| k × 90° | O(n²) | O(1) |

- `j < i` walks the lower triangle only; `j < n` would swap every pair twice and undo the transpose.
- `((k % 4) + 4) % 4` normalises negatives (`-1 → 3`) and collapses four turns to none, so at most
  three passes are ever made.
- `k = 2` is just two reversals, `k = 3` is transpose + reversing the row order; a rectangular matrix
  cannot be rotated in place (`out[j][rows - 1 - i] = matrix[i][j]` needs a new matrix).

## Set Matrix Zeroes

If an element is `0`, set its entire row and column to `0`, in place.

```cpp tab="Brute force"
class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        int m = matrix.size();
        int n = matrix[0].size();
        vector<pair<int, int>> cords;

        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (matrix[i][j] == 0) {
                    cords.push_back({i, j});
                }
            }
        }

        for (auto it : cords) {
            int row = it.first;
            int col = it.second;

            for (int i = 0; i < n; i++) {
                matrix[row][i] = 0;
            }

            for (int j = 0; j < m; j++) {
                matrix[j][col] = 0;
            }
        }
    }
};
```

```cpp tab="O(1) space"
class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        int m = matrix.size();
        int n = matrix[0].size();

        bool firstRowZero = false;
        bool firstColZero = false;

        // Remember whether row 0 / column 0 were zero before using them as markers.
        for (int i = 0; i < m; i++) {
            if (matrix[i][0] == 0) {
                firstColZero = true;
                break;
            }
        }

        for (int j = 0; j < n; j++) {
            if (matrix[0][j] == 0) {
                firstRowZero = true;
                break;
            }
        }

        // Mark inside the matrix, skipping row 0 and column 0.
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                if (matrix[i][j] == 0) {
                    matrix[i][0] = 0;
                    matrix[0][j] = 0;
                }
            }
        }

        // Apply the markers, again skipping row 0 and column 0.
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                if (matrix[i][0] == 0 || matrix[0][j] == 0) {
                    matrix[i][j] = 0;
                }
            }
        }

        if (firstRowZero) {
            for (int j = 0; j < n; j++) {
                matrix[0][j] = 0;
            }
        }

        if (firstColZero) {
            for (int i = 0; i < m; i++) {
                matrix[i][0] = 0;
            }
        }
    }
};
```

| Approach | Time | Space |
| --- | --- | --- |
| Brute force | O(m·n + k·(m + n)) | O(k) |
| First row / column markers | O(m·n) | O(1) |

- Both versions need every original zero recorded or marked **before** writing, otherwise the zeros
  you create get treated as new ones — the `cords` vector exists for exactly that reason.
- Brute force costs O(k·(m + n)) for `k` zeros and is O(m·n·(m + n)) when the matrix is all zeros;
  the marker version is a flat two passes plus the flags.
- `firstRowZero` / `firstColZero` are mandatory: `matrix[i][0]` and `matrix[0][j]` are both markers
  **and** real cells, so only the flags know which of them must be zeroed last.

## Pascal's Triangle

Three variants: a single element, one row, and the whole triangle.

### Single Element

Return the element at row `r`, column `c` (1-indexed).

```cpp
class Solution {
public:
    int pascalTriangleI(int r, int c) {
        return nCr(r - 1, c - 1);
    }

    int nCr(int n, int r) {
        if (r > n - r) r = n - r;
        if (r == 1) return n;

        int res = 1;
        for (int i = 0; i < r; i++) {
            res = res * (n - i);
            res = res / (i + 1);
        }
        return res;
    }
};
```

| Time | Space |
| --- | --- |
| O(min(c, r − c)) | O(1) |

- `C(n, r) = C(n, n - r)`, so reduce `r` first to halve the loop.
- `res * (n - i) / (i + 1)` is exact at every step — never reorder the divide.
- `int` overflows near `n = 30`; use `long long` for `res`.

### Row

Return row `r` (1-indexed) of the triangle.

```cpp
class Solution {
public:
    vector<int> pascalTriangleII(int r) {
        vector<int> ans;
        for (int i = 0; i < r; i++) {
            ans.push_back(nCr(r - 1, r - i - 1));
        }
        return ans;
    }

    int nCr(int n, int r) {
        if (r > n - r) r = n - r;
        if (r == 1) return n;
        int res = 1;
        for (int i = 0; i < r; i++) {
            res = res * (n - i);
            res = res / (i + 1);
        }
        return res;
    }
};
```

| Time | Space |
| --- | --- |
| O(r²) | O(1) extra, O(r) with output |

- `nCr(r - 1, r - i - 1)` walks the row from the right; rows are palindromic, so it works, but
  `nCr(r - 1, i)` is the direct form.
- `r` separate `nCr` calls make the row O(r²), not O(r).
- The ratio recurrence `C(n,k) = C(n,k-1) * (n-k+1) / k` builds the row in O(r).

### Full Triangle

Return the first `numRows` rows.

```cpp
class Solution {
public:
    int nCr(int n, int r) {
        if (r > n - r) r = n - r;
        long long res = 1;
        for (int i = 0; i < r; i++) {
            res = res * (n - i);
            res = res / (i + 1);
        }
        return res;
    }

    vector<vector<int>> pascalTriangleIII(int numRows) {
        int n = numRows;
        vector<vector<int>> ans;

        for (int i = 1; i <= n; i++) {
            vector<int> temp;
            for (int j = 1; j <= i; j++) {
                temp.push_back(nCr(i - 1, j - 1));
            }
            ans.push_back(temp);
        }

        return ans;
    }
};
```

| Time | Space |
| --- | --- |
| O(n³) | O(1) extra, O(n²) with output |

- `long long` in `nCr` avoids the intermediate overflow from the single-element version.
- O(n³) as written; the DP `ans[i][j] = ans[i-1][j-1] + ans[i-1][j]` is the expected O(n²).
- The 1-indexed bounds (`i = 1..n`, `j = 1..i`) must pair with `nCr(i-1, j-1)`.

## Two Sum

Return the indices of the two numbers that add up to `target`. Exactly one answer is assumed.

```cpp tab="Hash map"
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> mp;
        int n = nums.size();

        for (int i = 0; i < n; i++) {
            int k = target - nums[i];

            if (mp.find(k) != mp.end()) {
                return {i, mp[k]};
            }

            mp[nums[i]] = i;
        }

        return {-1, -1};
    }
};
```

```cpp tab="Sort + two pointers"
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        int n = nums.size();
        vector<pair<int, int>> numIdx;

        for (int i = 0; i < n; i++) {
            numIdx.push_back({nums[i], i});
        }

        sort(numIdx.begin(), numIdx.end());

        int left = 0, right = n - 1;

        while (left < right) {
            int s = numIdx[left].first + numIdx[right].first;

            if (s == target) {
                return {numIdx[left].second, numIdx[right].second};
            } else if (s < target) {
                left++;
            } else {
                right--;
            }
        }

        return {-1, -1};
    }
};
```

| Approach | Time | Space |
| --- | --- | --- |
| Hash map | O(n) expected | O(n) |
| Sort + two pointers | O(n log n) | O(n) |

- Look up `target - nums[i]` **before** inserting `nums[i]`: `[3, 3]` with target `6` only works because the
  first `3` is already in the map, and inserting first would let an index pair with itself.
- `pair` sorts by value, then by index, so duplicates stay distinct entries and the original indices
  survive; the price is the O(n) `numIdx` vector. On already-sorted values the two pointers are O(n)
  time and O(1) space, which is the usual reason to prefer them.
- The map returns `{i, mp[k]}` — indices in decreasing order — and `{-1, -1}` is only a sentinel because
  the statement guarantees a solution; swap the pair if ascending order is expected.

## Three Sum

Return every unique triplet that sums to `0`.

```cpp tab="Sort + two pointers"
class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        vector<vector<int>> ans;
        sort(nums.begin(), nums.end());
        int n = nums.size();

        for (int i = 0; i < n; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;

            int j = i + 1;
            int k = n - 1;

            while (j < k) {
                int sum = nums[i] + nums[j] + nums[k];

                if (sum < 0) {
                    j++;
                } else if (sum > 0) {
                    k--;
                } else {
                    ans.push_back({nums[i], nums[j], nums[k]});
                    j++;
                    k--;

                    while (j < k && nums[j] == nums[j - 1]) j++;
                    while (j < k && nums[k] == nums[k + 1]) k--;
                }
            }
        }

        return ans;
    }
};
```

```cpp tab="Hash set + set"
class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        set<vector<int>> tripletSet;
        int n = nums.size();

        for (int i = 0; i < n; i++) {
            set<int> hashset;

            for (int j = i + 1; j < n; j++) {
                int third = -(nums[i] + nums[j]);

                if (hashset.find(third) != hashset.end()) {
                    vector<int> temp = {nums[i], nums[j], third};
                    sort(temp.begin(), temp.end());
                    tripletSet.insert(temp);
                }

                hashset.insert(nums[j]);
            }
        }

        vector<vector<int>> ans(tripletSet.begin(), tripletSet.end());
        return ans;
    }
};
```

| Approach | Time | Space |
| --- | --- | --- |
| Sort + two pointers | O(n²) | O(1) extra |
| Hash set + set | O(n² log u) | O(n + u) |

- The anchor skip (`i > 0 && nums[i] == nums[i - 1]`) and the two post-hit `while` loops dedupe at the
  source; drop them and `[0, 0, 0, 0]` returns the same triplet four times.
- After `j++` / `k--` the loops compare against `nums[j - 1]` and `nums[k + 1]`, so `j < k` must be
  re-checked inside each `while` — otherwise the indices cross and read past the vector.
- The set version is slower by a `log u` factor: it sorts each candidate and pays `O(log u)` comparisons
  per `set<vector<int>>` insert on top of the O(n²) scan, while the inner `hashset` adds O(n) space.

## Sort 0s, 1s and 2s

Sort an array containing only `0`, `1` and `2` in one pass, in place — the Dutch national flag.

```cpp
class Solution {
public:
    void sortZeroOneTwo(vector<int>& nums) {
        int n = nums.size();

        int low = 0, mid = 0, high = n - 1;

        while (mid <= high) {
            if (nums[mid] == 0) {
                swap(nums[low], nums[mid]);
                low++;
                mid++;
            } else if (nums[mid] == 1) {
                mid++;
            } else {
                swap(nums[mid], nums[high]);
                high--;
            }
        }
    }
};
```

| Time | Space |
| --- | --- |
| O(n) | O(1) |

- The invariant: `[0, low)` is `0`s, `[low, mid)` is `1`s, `(high, n-1]` is `2`s, and `[mid, high]` is
  unexamined — so `mid <= high` is required, since `mid == high` still has one element left to classify.
- Swapping with `high` must **not** advance `mid`: the value pulled in from the right has not been looked
  at yet, while the value swapped into `low` is always a `1` (or `mid` itself), so `mid++` is safe there.
- One pass, no counting: a two-pass count of `0`s and `1`s is also O(n) but writes the array twice and
  needs two counters.

## Maximum Subarray

Return the largest sum of any contiguous subarray — Kadane's algorithm.

```cpp tab="Kadane"
class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int n = nums.size();
        int ans = INT_MIN;
        int cur = 0;

        for (int i = 0; i < n; i++) {
            cur += nums[i];
            ans = max(ans, cur);

            if (cur < 0) cur = 0;
        }

        return ans;
    }
};
```

```cpp tab="Kadane + indices"
class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int start = 0;
        int ansStart = -1, ansEnd = -1;
        long long sum = 0;
        long long maxi = LLONG_MIN;

        for (int i = 0; i < nums.size(); i++) {
            if (sum == 0) start = i;

            sum += nums[i];

            if (sum > maxi) {
                maxi = sum;
                ansStart = start;
                ansEnd = i;
            }

            if (sum < 0) sum = 0;
        }

        // ansStart and ansEnd bound the winning subarray.
        return (int)maxi;
    }
};
```

| Time | Space |
| --- | --- |
| O(n) | O(1) |

- `ans = INT_MIN` and not `0`: an all-negative array must return its largest (least negative) element,
  which is also why `ans` is updated before the reset.
- The reset condition is `cur < 0`, so a negative running sum still competes for the answer; resetting
  first would lose the single-element case.
- `if (sum == 0) start = i` begins a fresh run — a zero prefix adds nothing — and `ansStart` / `ansEnd`
  are updated together with `maxi`, so they always bound the winning window.
- `sum` and `maxi` are `long long` because the running total can pass `INT_MAX` for large inputs; the
  narrowing cast happens once, at the return.

## Next Permutation

Rearrange `nums` into the next lexicographically greater permutation, in place. If none exists, wrap
around to the smallest (ascending) order.

```cpp
class Solution {
public:
    void nextPermutation(vector<int>& nums) {
        int n = nums.size();
        int x = -1;

        // 1. Rightmost index that can still grow.
        for (int j = n - 2; j >= 0; j--) {
            if (nums[j] < nums[j + 1]) {
                x = j;
                break;
            }
        }

        if (x == -1) {
            reverse(nums.begin(), nums.end());
            return;
        }

        // 2. Swap with the rightmost value greater than nums[x].
        for (int i = n - 1; i > x; i--) {
            if (nums[i] > nums[x]) {
                swap(nums[i], nums[x]);
                break;
            }
        }

        // 3. The suffix is still non-increasing; reverse it to make it smallest.
        reverse(nums.begin() + x + 1, nums.end());
    }
};
```

| Time | Space |
| --- | --- |
| O(n) | O(1) |

- `x` is the last index with `nums[x] < nums[x + 1]`; if every pair is non-increasing the array is the
  largest permutation, which is why `x == -1` just reverses everything.
- Scanning from the right for `nums[i] > nums[x]` finds the **smallest** such value, because the suffix
  is non-increasing — the first hit is the right answer, so `break` is correct.
- The suffix stays non-increasing after the swap, so reversing it sorts it ascending in O(n); duplicates
  need no special handling. `next_permutation(nums.begin(), nums.end())` from `<algorithm>` is the same
  three steps.
