---
title: Arrays
description: Single-pass array patterns, in-place tricks and the edge cases interviewers like to probe.
section: dsa
order: 2
tags: [arrays, traversal, single-pass]
updated: 2026-10-24
---

Array questions are usually about doing one careful pass instead of reaching for sorting or extra
memory. This note collects the patterns and problems I want to be able to reproduce from memory.

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
