---
title: Arrays
description: Single-pass array patterns, in-place tricks and the edge cases interviewers like to probe.
section: dsa
order: 2
tags: [arrays, traversal, single-pass, stl]
updated: 2026-10-25
---

Array questions are usually about doing one careful pass instead of reaching for sorting or extra
memory. This note collects the patterns and problems I want to be able to reproduce from memory.

## STL toolbox

The functions I reach for most. Everything here is in `<algorithm>`, except `accumulate` which is in
`<numeric>`.

| Function | What it does | Typical call |
| --- | --- | --- |
| `sort` | Introsort, O(n log n), unstable | `sort(nums.begin(), nums.end())` |
| `reverse` | In-place reverse, O(n) | `reverse(nums.begin(), nums.end())` |
| `rotate` | Left-rotates by `mid - begin` | `rotate(nums.begin(), nums.begin() + k, nums.end())` |
| `max_element` / `min_element` | Iterator to the extreme | `*max_element(nums.begin(), nums.end())` |
| `accumulate` | Fold / sum, O(n) | `accumulate(nums.begin(), nums.end(), 0)` |
| `count` | Occurrences of a value | `count(nums.begin(), nums.end(), 0)` |
| `find` | Iterator to value, or `end()` | `find(nums.begin(), nums.end(), x) != nums.end()` |
| `unique` | Compacts adjacent duplicates, returns new end | `nums.erase(unique(nums.begin(), nums.end()), nums.end())` |
| `lower_bound` / `upper_bound` | Binary search on a **sorted** range | `lower_bound(nums.begin(), nums.end(), x)` |
| `nth_element` | Puts the k-th order statistic in place, O(n) average | `nth_element(nums.begin(), nums.begin() + k, nums.end())` |
| `next_permutation` | Next lexicographic permutation | `next_permutation(nums.begin(), nums.end())` |
| `remove` | Compacts non-matching values to the front | `remove(nums.begin(), nums.end(), 0)` |

`unique`, `remove` and `rotate` **do not change the container's size** — they only move elements and
return a new logical end. Pair them with `erase`, `fill` or `resize`. `set_union` and
`set_intersection` also live in `<algorithm>` and require sorted inputs.

## Second Largest Element

Return the **second largest distinct** element in `nums`, or `-1` when it does not exist. Track the
largest and second largest in one pass: a new maximum demotes the old maximum to second place.

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

| Time | Space | Passes |
| --- | --- | --- |
| O(n) | O(1) | 1 |

**Interview notes**

- The `num < maxEl` guard keeps duplicates of the maximum out of second place. Without it (or
  with `>=` in the first branch), an array like `[5, 5]` would report `5` as the second largest.
- Initialising with `LLONG_MIN` (instead of `-1`) keeps the logic correct for arrays containing
  negative numbers. Include `<climits>` when running this outside LeetCode.
- If every element is equal, `secMaxEl` stays `LLONG_MIN` and the function returns `-1`.
- Sorting first would cost O(n log n); the two-variable single pass keeps it O(n) with O(1) space.
- Edge cases worth checking: empty array, one element, duplicates, all negative, `INT_MIN` values.

**STL shortcut** — `nth_element(v.begin(), v.begin() + 1, v.end(), greater<int>());` is O(n) average
and puts the second largest at index `1`. For the second **distinct** value, dedupe first with
`sort(v.begin(), v.end());` and `v.erase(unique(v.begin(), v.end()), v.end());`.

## Max Consecutive Ones

Return the length of the longest run of `1`s. Keep a running count, reset it on `0`, and update the
answer after every element.

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

| Time | Space | Passes |
| --- | --- | --- |
| O(n) | O(1) | 1 |

**Interview notes**

- `if(nums[i])` treats any non-zero value as `1`. If the input can contain values other than `0`
  and `1`, compare explicitly with `nums[i] == 1`.
- Updating `ans` after every element handles an array that ends with a run — no special case is
  needed after the loop.
- The same pattern solves "longest run satisfying a condition": increment while the condition
  holds, reset the counter when it breaks.
- Edge cases: empty array (returns `0`), all zeros, all ones.

## Rotate Array

Rotate in place with three reversals. For a **left rotation** by `k`: reverse the first `k`
elements, reverse the remaining `n-k`, then reverse the whole array.

```cpp
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

**Right rotation** is the same idea in the opposite order: reverse the whole array first, then
reverse the first `k`, then reverse the rest.

```cpp
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
| Left rotate by `k` | O(n) | O(1) |
| Right rotate by `k` | O(n) | O(1) |

**Interview notes**

- **Guard first**: `if (n == 0) return;` must come before `k %= n`, otherwise an empty array
  triggers a division by zero. (The original snippet had those two lines swapped.)
- `k %= n` handles `k > n`. When `k == 0`, all three reversals cancel out and the array is
  unchanged.
- Three linear reversals make the time O(n); `std::reverse` works in place, so auxiliary space is
  O(1).
- Right rotate by `k` is the same as left rotate by `n - k`. Either form works — the reverse order
  above just avoids the extra subtraction.
- `std::reverse` lives in `<algorithm>`.
- Example: `[1,2,3,4,5]` left rotated by `2` → `[3,4,5,1,2]`; right rotated by `2` →
  `[4,5,1,2,3]`.

**STL shortcut** — `rotate(nums.begin(), nums.begin() + k, nums.end());` for a left rotation,
`rotate(nums.begin(), nums.end() - k, nums.end());` for a right rotation. O(n) time, O(1) space;
keep the `n == 0` guard before `k %= n`.

## Move Zeroes

Move every `0` to the end while keeping the relative order of the other elements. This must be done
in place, without copying the array.

Use a write pointer `j` for the next non-zero position. Scan with `i`; whenever `nums[i]` is
non-zero, swap it into `nums[j]` and advance `j`. Everything before `j` is non-zero and in order;
everything between `j` and `i` is zero.

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

| Time | Space | Order preserved | In-place |
| --- | --- | --- | --- |
| O(n) | O(1) | Yes | Yes |

**Interview notes**

- `j` never passes `i`, so each swap either does nothing (`i == j`) or moves a zero behind the
  non-zero element being written. The relative order of non-zero values is preserved.
- One pass: every element is visited once and swapped at most once.
- If there are no zeros, `i == j` throughout and the array is unchanged.
- The same write-index pattern solves "remove duplicates from sorted array" and "remove element".
- Avoid `erase` inside the loop — each erase is O(n) and shifts the remaining elements, making the
  whole thing O(n²).

**STL shortcut** — `stable_partition(nums.begin(), nums.end(), [](int x) { return x != 0; });` keeps
the order in O(n) time and O(n) space. The O(1)-space erase-remove one-liner is
`fill(remove(nums.begin(), nums.end(), 0), nums.end(), 0);` — `remove` compacts the non-zeros to the
front and returns the new logical end, then `fill` zeros the tail.

## Remove Duplicates from Sorted Array

Because the array is sorted, duplicates are adjacent. Keep a write index `i` pointing at the last
unique element; scan with `j`, and whenever `nums[j]` differs from `nums[i]`, advance `i` and write
the new value there. The first `i + 1` positions are the unique values in order.

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

| Time | Space | In-place | Order preserved |
| --- | --- | --- | --- |
| O(n) | O(1) | Yes | Yes |

**Interview notes**

- The empty array needs an explicit `return 0`. Without the guard, the original snippet returns `1`
  for an empty input because `i + 1` is always evaluated.
- `i` is the write pointer / index of the last unique value; `j` is the read pointer. Elements after
  `i` are stale and ignored — the judge only inspects the first `k` positions.
- Sorted input is required: duplicates are adjacent, so comparing `nums[i]` with `nums[j]` is
  enough. For an unsorted array, use a hash set or sort first.
- `std::unique` + `erase` is the one-liner equivalent (shown below): `unique` compacts the unique
  values in O(n) and the `erase` only trims the stale tail, so nothing is shifted.
- The same read/write-pointer pattern solves "remove element" and "move zeroes".

**STL shortcut** — `nums.erase(unique(nums.begin(), nums.end()), nums.end());` then
`return nums.size();` — O(n) time, O(1) auxiliary space, requires sorted input.

## Missing Number

Given an array of `n` distinct numbers from the range `[0, n]`, find the one number that is missing.
XOR everything in `1..n` and everything in the array; equal values cancel, leaving the missing
number.

```cpp
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

| Time | Space | In-place |
| --- | --- | --- |
| O(n) | O(1) | Yes |

**Interview notes**

- XOR is associative and commutative, and `x ^ x = 0`, `x ^ 0 = x`. Every value present in both
  ranges cancels, so the result is the missing number.
- The array holds `n` values from `0..n`; `0` contributes nothing to the XOR, which is why `xor1`
  can be built from `1..n` while `xor2` scans the array.
- The sum formula `n * (n + 1) / 2 - sum(nums)` is also O(n) / O(1), but it can overflow for large
  `n`; use `long long` or prefer XOR.
- Edge cases: empty array (returns `0`), missing `0`, missing `n`.
- Another O(1)-space option is cyclic sort, when the values are exactly `0..n` (or `1..n`).

**STL shortcut** — `return 1LL * n * (n + 1) / 2 - accumulate(nums.begin(), nums.end(), 0LL);` is
O(n) time and O(1) space, and the `0LL` keeps `accumulate` from overflowing `int`. XOR alternative:
`accumulate(nums.begin(), nums.end(), 0, bit_xor<int>())` folded with the XOR of `1..n`.

## Union of Two Sorted Arrays

Return the sorted **union** of two sorted arrays, with duplicates removed. Merge the two arrays like
merge sort, and only push a value when it differs from the last value already in the result. The
`temp.back()` check is what de-duplicates both within and across the two inputs.

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

| Time | Space | Sorted input required |
| --- | --- | --- |
| O(n + m) | O(n + m) | Yes |

**Interview notes**

- **The tail loops need the same `temp.empty()` guard.** If either input is empty, the first
  `temp.back()` call is undefined behaviour. The original snippet only checked `temp.size() == 0`
  in the main merge loop.
- `nums1[i] <= nums2[j]` (with `<=`) keeps the merge stable; either order is fine for a union of
  distinct values.
- The result is already sorted because both inputs are sorted and we always take the smaller
  front element.
- The space is O(n + m) for the output — that is unavoidable since the union itself can be that
  large. Only the pointers are O(1) extra.
- For **unsorted** inputs, either sort both first (O(n log n + m log m)) or use a `std::set` /
  `unordered_set`, which also removes duplicates.
- In C++, `std::set_union` does this in one call, but it assumes both ranges are sorted and still
  requires the output container.

**STL shortcut** — `set_union(nums1.begin(), nums1.end(), nums2.begin(), nums2.end(), back_inserter(ans));`
merges two sorted ranges in O(n + m). Add `ans.erase(unique(ans.begin(), ans.end()), ans.end());` for
distinct values, since `set_union` keeps a duplicate that appears in both inputs.

## Intersection of Two Sorted Arrays

Walk both sorted arrays with two pointers. Advance the smaller value; when the values are equal,
record it and advance both. This is the merge step of merge sort, restricted to matches.

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

| Time | Space | Sorted input required |
| --- | --- | --- |
| O(n + m) | O(min(n, m)) | Yes |

**Interview notes**

- This version keeps **multiplicities**: `[1,1,2]` ∩ `[1,2,2]` → `[1,2]`, but `[1,1,2]` ∩
  `[1,1,2]` → `[1,1,2]`. That is the "intersection of two arrays II" behaviour.
- If the problem wants **distinct** values only, skip a match that equals the last recorded one:

  ```cpp
  if (ans.empty() || ans.back() != nums1[i]) ans.push_back(nums1[i]);
  ```

- The output is sorted automatically, since matches are found in increasing order.
- Space is O(min(n, m)) because the result can never be longer than the shorter input (counted with
  multiplicity). Only the two pointers are O(1) extra.
- Advancing only the smaller side is what keeps it linear — comparing every pair would be O(n·m).
- For unsorted inputs, count frequencies with an `unordered_map` (O(n + m) expected time) and emit
  the minimum count for each key.
- In C++, `std::set_intersection` does the same thing given sorted ranges.

**STL shortcut** — `set_intersection(nums1.begin(), nums1.end(), nums2.begin(), nums2.end(), back_inserter(ans));`
is O(n + m) with the same multiplicity behaviour as the two-pointer version. Both inputs must be
sorted; add `ans.erase(unique(ans.begin(), ans.end()), ans.end());` for distinct values.
