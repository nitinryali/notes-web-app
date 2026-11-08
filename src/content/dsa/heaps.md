---
title: Heaps
description: Complete binary trees, heapify, build-heap, heap sort and the priority_queue shortcuts.
section: dsa
order: 4
tags: [heaps, priority-queue, heapify, heap-sort, arrays]
updated: 2026-11-07
---

A heap is a **complete binary tree** that satisfies the **heap property**. It is stored in a plain
array, so the index arithmetic below matters more than the tree picture. Everything here is 0-indexed,
which is what `vector` and C++'s `priority_queue` use.

## What a Heap Is

- **Complete binary tree** — every level except possibly the last is completely filled, and the last
  level is filled from left to right with no gaps.
- **Min-heap** — every parent is `<=` its children, so the minimum sits at the root.
- **Max-heap** — every parent is `>=` its children, so the maximum sits at the root.

| Heap | Root holds | Parent vs children | C++ comparator |
| --- | --- | --- | --- |
| Min-heap | smallest | `parent <= children` | `greater<int>` |
| Max-heap | largest | `parent >= children` | default |

## priority_queue

```cpp tab="C++"
priority_queue<int> pq;                                  // max-heap (default)
priority_queue<int, vector<int>, greater<int>> minPq;    // min-heap
```

```cpp tab="Java"
PriorityQueue<Integer> pq = new PriorityQueue<>();                          // min-heap
PriorityQueue<Integer> maxPq = new PriorityQueue<>(Collections.reverseOrder());
```

- The defaults are opposite: C++ gives a max-heap, Java a min-heap.
- `greater<int>` lives in `<functional>`; `priority_queue` itself is in `<queue>`.
- `top()` / `peek()` is O(1); `push`, `pop` and `emplace` are O(log n); building from a range is O(n).

## Internal Representation

```text
        1            index 0
      /   \
     3     5         index 1, 2
    / \   /
   7   9 8           index 3, 4, 5
```

| Relation | Index |
| --- | --- |
| Root | `0` |
| Left child of `i` | `2i + 1` |
| Right child of `i` | `2i + 2` |
| Parent of `i` (`i > 0`) | `(i - 1) / 2` |
| Leaves | `[n/2, n - 1]` |
| Internal nodes | `[0, n/2 - 1]` |

- Leaves fill the second half of the array; `n/2 - 1` is the last parent, which is why every build
  loop starts there.
- There are no node objects and no pointers — the tree exists only through these formulas, and the
  complete shape is what keeps it balanced.

## Heapify

```cpp
class Solution {
public:
    void heapifyDown(vector<int>& nums, int ind) {
        int n = nums.size();
        int smallestInd = ind;
        int leftChildInd = 2 * ind + 1;
        int rightChildInd = 2 * ind + 2;

        if (leftChildInd < n && nums[leftChildInd] < nums[smallestInd]) {
            smallestInd = leftChildInd;
        }

        if (rightChildInd < n && nums[rightChildInd] < nums[smallestInd]) {
            smallestInd = rightChildInd;
        }

        if (smallestInd != ind) {
            swap(nums[smallestInd], nums[ind]);
            heapifyDown(nums, smallestInd);
        }
    }

    void heapifyUp(vector<int>& nums, int ind) {
        int parentInd = (ind - 1) / 2;

        if (ind > 0 && nums[parentInd] > nums[ind]) {
            swap(nums[parentInd], nums[ind]);
            heapifyUp(nums, parentInd);
        }
    }

    void heapify(vector<int>& nums, int ind, int val) {
        if (nums[ind] > val) {      // smaller value can only break the parent link
            nums[ind] = val;
            heapifyUp(nums, ind);
        } else {                    // larger value can only break the children links
            nums[ind] = val;
            heapifyDown(nums, ind);
        }
    }
};
```

| Operation | Time | Space |
| --- | --- | --- |
| `heapifyDown` | O(log n) | O(log n) stack |
| `heapifyUp` | O(log n) | O(log n) stack |

- `heapifyDown` requires both subtrees to be valid heaps; it repairs at most one path from the node
  down to a leaf, so it costs the height, not the subtree size.
- `heapifyUp` assumes everything except the node itself is valid — it is the insert path.
- `heapify(nums, ind, val)` is only the direction test: a smaller value can break the parent link, a
  larger one can break the children links. Equal values fall into `heapifyDown`, which stops at once.

## Build Heap from Array

```cpp
class Solution {
private:
    void heapifyDown(vector<int>& arr, int ind) {
        int n = arr.size();
        int smallestInd = ind;
        int leftChildInd = 2 * ind + 1, rightChildInd = 2 * ind + 2;

        if (leftChildInd < n && arr[leftChildInd] < arr[smallestInd])
            smallestInd = leftChildInd;

        if (rightChildInd < n && arr[rightChildInd] < arr[smallestInd])
            smallestInd = rightChildInd;

        if (smallestInd != ind) {
            swap(arr[smallestInd], arr[ind]);
            heapifyDown(arr, smallestInd);
        }
    }

public:
    void buildMinHeap(vector<int>& nums) {
        int n = nums.size();

        for (int i = n / 2 - 1; i >= 0; i--) {
            heapifyDown(nums, i);
        }
    }
};
```

| Time | Space |
| --- | --- |
| O(n) | O(log n) stack |

- Start at the last internal node, `n / 2 - 1`: everything after it is a leaf and already a valid
  heap, so the loop only has to fix nodes with children.
- Bottom-up heapify is O(n), not O(n log n): half the nodes are leaves and the sum
  `n/4·1 + n/8·2 + …` converges, so the average work per node is constant.
- Inserting the elements one by one with `heapifyUp` gives the same heap in O(n log n) — correct, but
  a worse constant.

## Implement a Min Heap

`insert` → `heapifyUp`, `changeKey` → whichever direction the new value moves, `extractMin` → swap with
the last element and `heapifyDown`.

```cpp
class Solution {
   private:
    vector<int> arr;
    int count;

    void heapifyUp(vector<int>& arr, int ind) {
        int parentInd = (ind - 1) / 2;

        if (ind > 0 && arr[ind] < arr[parentInd]) {
            swap(arr[ind], arr[parentInd]);
            heapifyUp(arr, parentInd);
        }
    }

    void heapifyDown(vector<int>& arr, int ind) {
        int n = arr.size();
        int smallestInd = ind;
        int leftChildInd = 2 * ind + 1, rightChildInd = 2 * ind + 2;

        if (leftChildInd < n && arr[leftChildInd] < arr[smallestInd])
            smallestInd = leftChildInd;

        if (rightChildInd < n && arr[rightChildInd] < arr[smallestInd])
            smallestInd = rightChildInd;

        if (smallestInd != ind) {
            swap(arr[smallestInd], arr[ind]);
            heapifyDown(arr, smallestInd);
        }
    }

   public:
    void initializeHeap() {
        arr.clear();
        count = 0;
    }

    void insert(int key) {
        arr.push_back(key);
        heapifyUp(arr, count);
        count += 1;
    }

    void changeKey(int index, int new_val) {
        if (arr[index] > new_val) {     // value decreased: it may rise
            arr[index] = new_val;
            heapifyUp(arr, index);
        } else {                        // value increased: it may sink
            arr[index] = new_val;
            heapifyDown(arr, index);
        }
    }

    void extractMin() {
        swap(arr[0], arr[count - 1]);
        arr.pop_back();
        count -= 1;
        heapifyDown(arr, 0);
    }

    bool isEmpty() { return count == 0; }

    int getMin() { return arr[0]; }

    int heapSize() { return count; }
};
```

| Operation | Time |
| --- | --- |
| `insert` | O(log n) |
| `extractMin` | O(log n) |
| `changeKey` | O(log n) |
| `getMin`, `isEmpty`, `heapSize` | O(1) |

- `count` duplicates `arr.size()`; keep the two in sync, or drop `count` and use `arr.size()`.
- `extractMin` must guard against an empty heap — `arr[0]` on empty is undefined.
- `changeKey` compares the new value with the old to choose the direction: decreasing a min-heap key
  can only break the parent link, increasing it can only break the children.

## Implement a Max Heap

Identical structure, comparisons flipped: `>` instead of `<`, largest child instead of smallest.

```cpp
class Solution {
   private:
    vector<int> arr;
    int count;

    void heapifyUp(int ind) {
        int parentInd = (ind - 1) / 2;

        if (ind > 0 && arr[ind] > arr[parentInd]) {
            swap(arr[ind], arr[parentInd]);
            heapifyUp(parentInd);
        }
    }

    void heapifyDown(int ind) {
        int n = arr.size();
        int largestInd = ind;
        int leftChildInd = 2 * ind + 1, rightChildInd = 2 * ind + 2;

        if (leftChildInd < n && arr[leftChildInd] > arr[largestInd])
            largestInd = leftChildInd;

        if (rightChildInd < n && arr[rightChildInd] > arr[largestInd])
            largestInd = rightChildInd;

        if (largestInd != ind) {
            swap(arr[largestInd], arr[ind]);
            heapifyDown(largestInd);
        }
    }

   public:
    void initializeHeap() {
        arr.clear();
        count = 0;
    }

    void insert(int key) {
        arr.push_back(key);
        heapifyUp(count);
        count = count + 1;
    }

    void changeKey(int index, int new_val) {
        if (arr[index] < new_val) {     // value increased: it may rise
            arr[index] = new_val;
            heapifyUp(index);
        } else {                        // value decreased: it may sink
            arr[index] = new_val;
            heapifyDown(index);
        }
    }

    void extractMax() {
        swap(arr[0], arr[count - 1]);
        arr.pop_back();
        count = count - 1;
        heapifyDown(0);
    }

    bool isEmpty() { return count == 0; }

    int getMax() { return arr[0]; }

    int heapSize() { return count; }
};
```

| Operation | Time |
| --- | --- |
| `insert` | O(log n) |
| `extractMax` | O(log n) |
| `changeKey` | O(log n) |
| `getMax`, `isEmpty`, `heapSize` | O(1) |

- The only difference from the min-heap is the comparison in each `if`; the shape and the indices are
  shared.
- `changeKey` reverses too: increasing a max-heap key may rise, decreasing it may sink.
- Here `heapifyUp` / `heapifyDown` read `arr` from the member, where the min-heap version passes it as
  a parameter — both work, but pick one convention.

## Check if an Array Is a Min Heap

```cpp
class Solution {
public:
    bool isHeap(vector<int>& nums) {
        int n = nums.size();

        for (int i = n / 2 - 1; i >= 0; i--) {
            int leftChildInd = 2 * i + 1;
            int rightChildInd = 2 * i + 2;

            if (leftChildInd < n && nums[leftChildInd] < nums[i])
                return false;

            if (rightChildInd < n && nums[rightChildInd] < nums[i])
                return false;
        }

        return true;
    }
};
```

| Time | Space |
| --- | --- |
| O(n) | O(1) |

- Only internal nodes need checking; leaves have no children, so the scan starts at `n / 2 - 1`.
- Checking parent against its two children is enough — transitivity gives the whole heap property.
- `n = 0` and `n = 1` return `true`; the loop body never runs.

## Convert Min Heap to Max Heap

```cpp
class Solution {
public:
    void heapifyDown(vector<int>& nums, int ind) {
        int n = nums.size();
        int largestInd = ind;
        int leftChildInd = 2 * ind + 1;
        int rightChildInd = 2 * ind + 2;

        if (leftChildInd < n && nums[leftChildInd] > nums[largestInd]) {
            largestInd = leftChildInd;
        }

        if (rightChildInd < n && nums[rightChildInd] > nums[largestInd]) {
            largestInd = rightChildInd;
        }

        if (largestInd != ind) {
            swap(nums[ind], nums[largestInd]);
            heapifyDown(nums, largestInd);
        }
    }

    vector<int> minToMaxHeap(vector<int> nums) {
        int n = nums.size();

        for (int i = n / 2 - 1; i >= 0; i--) {
            heapifyDown(nums, i);
        }

        return nums;
    }
};
```

| Time | Space |
| --- | --- |
| O(n) | O(log n) stack |

- Reuse build-heap with `>` comparisons; the input being a valid min-heap buys nothing, since the
  target property is different.
- Reversing the array does **not** work — a reversed min-heap is not a max-heap, it is just another
  min-heap-shaped array.
- Taking the copy by value leaves the caller's vector untouched; return by reference if that copy
  matters.

## Heap Sort

```java
class Solution {
  public void heapifyDown(int[] nums, int last, int i) {
    int largestInd = i;
    int leftChildInd = 2 * i + 1;
    int rightChildInd = 2 * i + 2;

    if (leftChildInd <= last && nums[leftChildInd] > nums[largestInd]) {
      largestInd = leftChildInd;
    }
    if (rightChildInd <= last && nums[rightChildInd] > nums[largestInd]) {
      largestInd = rightChildInd;
    }

    if (largestInd != i) {
      int temp = nums[largestInd];
      nums[largestInd] = nums[i];
      nums[i] = temp;
      heapifyDown(nums, last, largestInd);
    }
  }

  public void buildMaxHeap(int[] nums) {
    int n = nums.length;
    for (int i = n / 2 - 1; i >= 0; i--) {
      heapifyDown(nums, n - 1, i);
    }
  }

  public void heapSort(int[] nums) {
    buildMaxHeap(nums);
    int last = nums.length - 1;

    while (last > 0) {
      int temp = nums[0];
      nums[0] = nums[last];
      nums[last] = temp;
      last--;
      if (last > 0) {
        heapifyDown(nums, last, 0);
      }
    }
  }
}
```

| Time | Space |
| --- | --- |
| O(n log n) | O(1) |

- Build a max-heap, then repeatedly swap the root to the end and heapify the shrinking prefix: the
  largest values pile up at the back in sorted order.
- `last` is passed into `heapifyDown` instead of using `nums.length`, so the sorted tail is never
  touched — the boundary, not the array size, is the limit.
- The `if (last > 0)` guard skips a one-element prefix; the `last > 0` loop condition already stops
  before the final swap.

## Kth Largest Element in an Array

```cpp
class Solution {
public:
    void heapifyDown(vector<int>& nums, int last, int i) {
        int largestInd = i;
        int leftChildInd = 2 * i + 1;
        int rightChildInd = 2 * i + 2;

        if (leftChildInd <= last && nums[leftChildInd] > nums[largestInd]) {
            largestInd = leftChildInd;
        }
        if (rightChildInd <= last && nums[rightChildInd] > nums[largestInd]) {
            largestInd = rightChildInd;
        }
        if (largestInd != i) {
            swap(nums[largestInd], nums[i]);
            heapifyDown(nums, last, largestInd);
        }
    }

    void buildMaxHeap(vector<int>& nums) {
        int n = nums.size();
        for (int i = n / 2 - 1; i >= 0; i--) {
            heapifyDown(nums, n - 1, i);
        }
    }

    int kthLargestElement(vector<int>& nums, int k) {
        buildMaxHeap(nums);
        int ans = -1;
        int last = nums.size() - 1;

        while (k--) {
            ans = nums[0];
            swap(nums[0], nums[last]);
            last--;
            if (last >= 0) {
                heapifyDown(nums, last, 0);
            }
        }

        return ans;
    }
};
```

| Time | Space |
| --- | --- |
| O(n + k log n) | O(1) |

- Extract the maximum `k` times: `nums[0]` before each swap is the current largest, so the loop ends
  on the k-th one.
- Build-heap O(n) plus `k` extractions at O(log n) each; the answer is available before the heap is
  fully drained.
- It destroys the input order. A size-`k` min-heap is O(n log k) and leaves the array intact;
  quickselect is O(n) average, O(n²) worst.

## Kth Largest in a Stream

Design a class that returns the k-th largest value seen so far, including after each `add`.

```cpp
class KthLargest {
   private:
    priority_queue<int, vector<int>, greater<int>> pq;
    int K;

   public:
    KthLargest(int k, vector<int>& nums) {
        K = k;

        for (int i = 0; i < nums.size(); i++) {
            if (pq.size() < K) {
                pq.push(nums[i]);
            } else if (nums[i] > pq.top()) {
                pq.pop();
                pq.push(nums[i]);
            }
        }
    }

    int add(int val) {
        if (pq.size() < K) {
            pq.push(val);
        } else if (val > pq.top()) {
            pq.pop();
            pq.push(val);
        }
        return pq.top();
    }
};
```

| Operation | Time | Space |
| --- | --- | --- |
| Constructor | O(n log k) | O(k) |
| `add` | O(log k) | O(k) |

- A **min**-heap keeps the k largest values, so its root is the smallest of them — exactly the k-th
  largest, and `add` only has to touch the heap when the new value beats the root.
- The constructor uses the same rule as `add`: fill while `size() < k`, replace afterwards. The input
  order does not matter.
- Sorting and taking `nums[k - 1]` is O(n log n) **per query** — fine for a one-off array, useless for a
  stream where each `add` would re-sort.

## Top K Frequent Elements

Return the `k` most frequent values.

```cpp
class Solution {
public:
    vector<int> topKFrequent(const vector<int>& nums, int k) {
        unordered_map<int, int> freq;
        for (int num : nums) freq[num]++;

        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> minHeap;

        for (auto& it : freq) {
            minHeap.push({it.second, it.first});
            if (minHeap.size() > k) minHeap.pop();
        }

        vector<int> result;
        while (!minHeap.empty()) {
            result.push_back(minHeap.top().second);
            minHeap.pop();
        }

        return result;
    }
};
```

| Time | Space |
| --- | --- |
| O(n log k) | O(n + k) |

- The heap holds `k` entries and evicts the smallest count, so it ends up containing the top `k` — the
  same "keep the best k" pattern as the stream problem.
- `pair` comparison is lexicographic, so `{count, value}` ranks by frequency and uses the value only as
  a tie-breaker; the result therefore comes out in **ascending** frequency, reverse it if needed.
- Counting is O(n) and the heap work is O(log k) per distinct value; bucketing by frequency gives O(n)
  time and O(n) space without the `log k`.

## Merge K Sorted Lists

Merge `k` sorted linked lists into one sorted list.

```cpp
class Solution {
public:
    ListNode* mergeKSortedLists(vector<ListNode*>& heads) {
        auto cmp = [](ListNode* a, ListNode* b) {
            return a->val > b->val;
        };
        priority_queue<ListNode*, vector<ListNode*>, decltype(cmp)> pq(cmp);

        for (auto node : heads) {
            if (node) pq.push(node);
        }

        ListNode dummy(0);
        ListNode* tail = &dummy;

        while (!pq.empty()) {
            ListNode* smallest = pq.top();
            pq.pop();

            tail->next = smallest;
            tail = tail->next;

            if (smallest->next) pq.push(smallest->next);
        }

        return dummy.next;
    }
};
```

| Time | Space |
| --- | --- |
| O(N log k) | O(k) |

- `priority_queue` orders with "less" semantics, so a min-heap needs the `>` comparator — writing `<`
  turns it into a max-heap and the merge silently returns the wrong list.
- `decltype(cmp)` is only a type; the comparator object still has to be passed to the constructor as
  `pq(cmp)`, because a lambda has no default constructor.
- The dummy node removes the "first node" special case, and pushing `smallest->next` after each pop keeps
  the heap at `k` nodes, so no list is ever fully copied into it.

## Median of a Data Stream

Design a class with `addNum` and `findMedian`.

```cpp tab="Sort on demand"
class MedianFinder {
private:
    vector<int> nums;

public:
    MedianFinder() {}

    void addNum(int num) {
        nums.push_back(num);
    }

    double findMedian() {
        if (nums.empty()) return 0.0;

        vector<int> sortedNums = nums;
        sort(sortedNums.begin(), sortedNums.end());
        int n = (int)sortedNums.size();

        if (n % 2 == 1) {
            return (double)sortedNums[n / 2];
        } else {
            double a = sortedNums[n / 2 - 1];
            double b = sortedNums[n / 2];
            return (a + b) / 2.0;
        }
    }
};
```

```cpp tab="Two heaps"
class MedianFinder {
public:
    priority_queue<int> maxHeap;
    priority_queue<int, vector<int>, greater<int>> minHeap;

    MedianFinder() {}

    void addNum(int num) {
        if (maxHeap.empty() || num <= maxHeap.top())
            maxHeap.push(num);
        else
            minHeap.push(num);

        if (maxHeap.size() > minHeap.size() + 1) {
            minHeap.push(maxHeap.top());
            maxHeap.pop();
        } else if (minHeap.size() > maxHeap.size() + 1) {
            maxHeap.push(minHeap.top());
            minHeap.pop();
        }
    }

    double findMedian() {
        if (maxHeap.size() == minHeap.size())
            return (maxHeap.top() + minHeap.top()) / 2.0;

        return (maxHeap.size() > minHeap.size()) ? maxHeap.top() : minHeap.top();
    }
};
```

| Operation | Sort on demand | Two heaps |
| --- | --- | --- |
| `addNum` | O(1) | O(log n) |
| `findMedian` | O(n log n) | O(1) |
| Space | O(n) | O(n) |

- The max-heap holds the smaller half (its root is the lower median) and the min-heap the larger half;
  keeping the sizes within one of each other is what makes the median a two-value lookup.
- Insert against `maxHeap.top()`, the boundary between halves, then move a single element across when a
  side grows by two — never rebalance by rebuilding.
- For an even count the answer is the average of the two roots, so use `/ 2.0`: integer division would
  truncate the median.

## Maximum Sum Combination

Return the `k` largest sums of the form `nums1[i] + nums2[j]`, with each pair used once.

```cpp
class Solution {
public:
    vector<int> maxSumCombinations(vector<int>& nums1, vector<int>& nums2, int k) {
        sort(nums1.begin(), nums1.end(), greater<int>());
        sort(nums2.begin(), nums2.end(), greater<int>());

        priority_queue<pair<int, pair<int, int>>> pq;
        set<pair<int, int>> visited;

        pq.push({nums1[0] + nums2[0], {0, 0}});
        visited.insert({0, 0});

        vector<int> res;

        while (k-- && !pq.empty()) {
            auto [sum, idx] = pq.top();
            pq.pop();

            int i = idx.first, j = idx.second;
            res.push_back(sum);

            if (i + 1 < nums1.size() && !visited.count({i + 1, j})) {
                pq.push({nums1[i + 1] + nums2[j], {i + 1, j}});
                visited.insert({i + 1, j});
            }

            if (j + 1 < nums2.size() && !visited.count({i, j + 1})) {
                pq.push({nums1[i] + nums2[j + 1], {i, j + 1}});
                visited.insert({i, j + 1});
            }
        }

        return res;
    }
};
```

| Time | Space |
| --- | --- |
| O(n log n + m log m + k log k) | O(k) |

- Sort both arrays descending so the best pair is `(0, 0)` and every other pair is one step down in
  either index — that is what makes a best-first traversal possible at all.
- `visited` is essential: `(i + 1, j)` and `(i, j + 1)` both reach `(i + 1, j + 1)`, so without the set
  the heap grows exponentially and the same sum is emitted twice.
- `k-- && !pq.empty()` stops at `k` answers or when the pairs run out, which covers `k > n·m` and an
  empty input; the max-heap's pair ordering compares the sum first, so `top()` is always the next best.

## Complexities at a Glance

| Operation | Time |
| --- | --- |
| Build from an array | O(n) |
| Peek root | O(1) |
| Insert | O(log n) |
| Extract root | O(log n) |
| Change a key at a known index | O(log n) |
| Delete an arbitrary element | O(log n) after a linear search for its index |
| Heap sort | O(n log n) |
| Kth largest (extract k times) | O(n + k log n) |
