---
title: Sorting Algorithms
description: Bubble, selection, insertion, cyclic, merge and quick sort — implementations, complexities and the trade-offs interviewers probe.
section: dsa
order: 1
tags: [sorting, arrays, complexity, stl]
updated: 2026-10-25
---

Sorting questions test whether you can reason about **stability, adaptivity and space**, not
just recite an algorithm. These are the six implementations worth being able to write from
memory, followed by the comparison table I revise before an interview. In real code you call
`std::sort`; the one-liners live in the STL note.

## At a glance

| Algorithm | Best | Average | Worst | Space | Stable | Adaptive | In-place |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Bubble sort | O(n) | O(n²) | O(n²) | O(1) | Yes | Yes | Yes |
| Selection sort | O(n²) | O(n²) | O(n²) | O(1) | No | No | Yes |
| Insertion sort | O(n) | O(n²) | O(n²) | O(1) | Yes | Yes | Yes |
| Cyclic sort | O(n) | O(n) | O(n) | O(1) | No | No | Yes |
| Merge sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes | No | No |
| Quick sort | O(n log n) | O(n log n) | O(n²) | O(n) | No | No | Yes |

**Definitions.** _Stable_ keeps equal elements in their original relative order. _Adaptive_ gets
faster on already / nearly sorted input. _In-place_ means O(1) auxiliary space, ignoring the
recursion stack. Cyclic sort's O(n) bound only holds when the array is a permutation of `1..n`.

## Bubble Sort

Repeatedly compare adjacent pairs and swap when they are out of order. After each pass the
largest remaining element has "bubbled" to the end. The `flag` stops early when a pass makes
no swaps, which is what makes the best case O(n).

```cpp
void bubbleSort(vector<int>& nums) {
     int n = nums.size();
     for(int i=0;i<n-1;i++){
	   bool flag = 1;
       for(int j=0;j<n-i-1;j++){
             if(nums[j]>nums[j+1]){
                 flag = 0;
                 swap(nums[j],nums[j+1]);
             }
       }
       if(flag) break;
    }
}
```

| Time | Space | Stable | Adaptive | In-place |
| --- | --- | --- | --- | --- |
| O(n²) | O(1) | Yes | Yes | Yes |

**Interview notes**

- Without the `bool flag`, the best case degrades to O(n²) as well.
- Each swap fixes exactly one inversion, so there are at most `n(n-1)/2` swaps.
- Stable because equal neighbours are never swapped (`nums[j] > nums[j+1]` is strict).
- Rarely used in practice — its value is explaining stability and adaptivity.

## Recursive Bubble Sort

The same bubbling idea, expressed recursively: one pass pushes the largest remaining element to
the end, then the function recurses on the shorter prefix. The `flag` still short-circuits
already-sorted input.

```cpp
void helper(vector<int>& nums, int n) {
    if(n<=0) return;
    bool flag = 1;
    for(int j=0;j<n;j++){
        if(nums[j]>nums[j+1]){
             swap(nums[j],nums[j+1]);
             flag=0;
        }
    }
    if(flag) return;
    helper(nums,n-1);
}

vector<int> bubbleSort(vector<int>& nums) {
    int n = nums.size();
    if(n==0 || n==1) return nums;
    helper(nums, n-1);
    return nums;
}
```

| Time | Space | Stable | Adaptive | In-place |
| --- | --- | --- | --- | --- |
| O(n²) | O(n) | Yes | Yes | Yes |

**Interview notes**

- The O(n) space is the **recursion stack** (depth up to `n`), not a temporary array — that is
  the only complexity change compared with iterative bubble sort.
- `helper(nums, n-1)` makes the first pass compare indices `0..n-1`, so `j+1` stays in bounds;
  each recursive call shrinks the range by one.
- The `flag` keeps the best case O(n) on sorted input. Without it, every case is O(n²).
- The wrapper must `return nums` in the empty / single-element case. A bare `return;` in a
  function returning `vector<int>` will not compile.

## Selection Sort

Scan the unsorted suffix for the minimum and swap it into position `i`. The sorted prefix grows
from left to right, and the array is fully sorted after `n-1` passes.

```cpp
void selectionSort(vector<int>& nums) {
      int n = nums.size();
      for(int i=0;i<n-1;i++){
         int mini = i;
         for(int j=i+1;j<n;j++){
              if(nums[j]<nums[mini]){
                  mini = j;
              }
         }
         if(mini!=i) swap(nums[i],nums[mini]);
      }
}
```

| Time | Space | Stable | Adaptive | In-place |
| --- | --- | --- | --- | --- |
| O(n²) | O(1) | No | No | Yes |

**Interview notes**

- Performs at most `n-1` swaps — the minimum possible number of writes. Useful when writes are
  expensive (e.g. flash memory).
- **Not stable**: a long-distance swap can jump an equal element past its twin.
  Example: `[2a, 2b, 1]` → `[1, 2b, 2a]`.
- **Not adaptive**: the inner loop always scans the whole suffix, even if the array is sorted.
- Time is Θ(n²) in every case; there is no best-case shortcut.

## Insertion Sort

Grow a sorted prefix one element at a time. Each new element (`key`) is inserted into its place
by shifting every larger element one slot to the right.

```cpp
void insertionSort(vector<int>& nums) {
     int n = nums.size();
     for(int i=1;i<n;i++){
        int key=nums[i];
        int j = i-1;
        while(j>=0 && nums[j]>key){
            nums[j+1]=nums[j];
            j--;
        }
        nums[j+1]=key;
     }
}
```

| Time | Space | Stable | Adaptive | In-place |
| --- | --- | --- | --- | --- |
| O(n²) | O(1) | Yes | Yes | Yes |

**Interview notes**

- Best case O(n) when the array is already sorted — exactly one comparison per element.
- Excellent for **small** or **nearly sorted** arrays; this is why hybrid sorts (Timsort,
  introsort) switch to insertion sort below a size threshold.
- Stable because we stop at the first element `<= key` (strict `>` in the while condition).
- Online: it can sort a stream as elements arrive.

## Cyclic Sort

Cyclic sort applies when the array is a permutation of `1..n`: every value already knows where it
belongs, so put each one at index `value - 1`. Every swap places at least one element in its final
position, which is why the total work stays linear.

```cpp
void cyclicSort(vector<int>& nums) {
    int i = 0;
    int n = nums.size();

    while (i < n) {
        int correctIdx = nums[i] - 1;

        if (nums[i] != nums[correctIdx]) {
            swap(nums[i], nums[correctIdx]);
        } else {
            i++;
        }
    }
}
```

| Time | Space | Stable | Adaptive | In-place |
| --- | --- | --- | --- | --- |
| O(n) | O(1) | No | No | Yes |

**Interview notes**

- **Not a comparison sort** — it uses the value itself as an index, so it never compares two
  elements to decide the order.
- Only valid when values fall in the range `1..n` (use `correctIdx = nums[i]` for `0..n`). For
  arbitrary values, fall back to a normal sort.
- The `nums[i] != nums[correctIdx]` check also handles duplicates: once a duplicate is at its
  correct index, `i` moves on instead of swapping forever.
- Each swap fixes at least one element, so there are at most `n` swaps; the outer `while` also
  runs O(n) times → O(n) overall.
- **Not stable** (long-distance swaps) and **not adaptive**.
- Classic problems: missing number, find the duplicate, first missing positive, find all numbers
  disappeared in an array.

## Merge Sort

Divide the array in half, sort each half recursively, then merge the two sorted halves using an
auxiliary buffer. The merge takes the smaller front element each time, which is what preserves
stability.

```cpp
void merging(vector<int>& nums, int low, int mid, int high){
    vector<int> temp;
    int left = low;
    int right = mid+1;
    while(left<=mid && right<=high) {
        if(nums[left]<=nums[right]){
            temp.push_back(nums[left]);
            left++;
        } else {
            temp.push_back(nums[right]);
            right++;
        }
    }
    while(left<=mid){
     temp.push_back(nums[left]);
     left++;
    }

    while(right<=high){
     temp.push_back(nums[right]);
     right++;
    }

    for(int i=low;i<=high;i++){
        nums[i]=temp[i-low];
    }
}

void mergeSort(vector<int>& nums, int low, int high) {
    if(low>=high) return;
    int mid = low + (high-low)/2;
    mergeSort(nums, low, mid);
    mergeSort(nums, mid+1, high);
    merging(nums, low, mid, high);
}

vector<int> merge(vector<int>& nums){
    int n = nums.size();
    mergeSort(nums, 0, n-1);
    return nums;
}
```

| Time | Space | Stable | Adaptive | In-place |
| --- | --- | --- | --- | --- |
| O(n log n) | O(n) | Yes | No | No |

**Interview notes**

- Θ(n log n) in **all** cases — no adversarial input, which is why it is used when worst-case
  guarantees matter.
- The `<=` in `nums[left] <= nums[right]` is what makes it stable; using `<` breaks stability.
- Recursion depth is O(log n); the O(n) term is the temporary merge buffer.
- Natural fit for **linked lists** (merge without extra space) and **external sorting** (data
  larger than RAM).
- Merge sort is the standard answer for "sort a huge file that does not fit in memory".

## Quick Sort

Pick a pivot, partition the array so smaller/equal elements sit on the left and larger ones on
the right, then recurse on both sides. This implementation randomises the pivot first, which
avoids the common O(n²) trap on already-sorted input.

```cpp
int getPartition(vector<int>& nums, int low, int high) {
    int randIdx = low + rand() % (high-low+1);
    swap(nums[low],nums[randIdx]);
    int pivot = nums[low];
    int i=low,j=high;

    while(i<j){
        while(i<high && nums[i]<=pivot) i++;
        while(j>low && nums[j]>pivot) j--;
        if(i<j) swap(nums[i],nums[j]);
    }
    swap(nums[low],nums[j]);
    return j;
}

void quickSort(vector<int>& nums, int low, int high) {
   if(low>=high) return;
   int partition = getPartition(nums, low, high);
   quickSort(nums, low, partition-1);
   quickSort(nums, partition+1, high);
}

vector<int> quickie(vector<int> nums){
   int n = nums.size();
   quickSort(nums, 0, n-1);
   return nums;
}
```

| Time | Space | Stable | Adaptive | In-place |
| --- | --- | --- | --- | --- |
| O(n log n) | O(n) | No | No | Yes |

**Interview notes**

- Average O(n log n), worst O(n²) when the pivot is always the smallest or largest element.
  Randomising the pivot (as above) makes that worst case astronomically unlikely.
- The O(n) space is the **recursion stack** in the worst case (O(log n) on average). Recurse on
  the smaller side first and loop on the larger side to guarantee O(log n) stack depth.
- **Not stable**: partitioning swaps elements across long distances.
- In practice the fastest general-purpose in-place sort — good cache locality and low constant
  factors. `std::sort` uses introsort (quick sort + heap sort + insertion sort).
- The same partition routine powers **quickselect** for "kth largest element" in expected O(n).

## STL shortcuts

Sorting one-liners (`sort`, `stable_sort`, `nth_element`, `partial_sort`, comparators) live in the
**STL** note, under *Sorting algorithms*.
