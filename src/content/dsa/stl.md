---
title: STL
description: Containers, algorithms and the shortcuts that replace hand-written loops.
section: dsa
order: 3
tags: [stl, cpp, containers, algorithms]
updated: 2026-10-25
---

Reference notes for the parts of the C++ standard library I use in interviews: which container to
pick, and the algorithms that turn a loop into one line. Everything is in `std`; most algorithms need
`<algorithm>`, and the numeric helpers need `<numeric>`.

## Containers at a glance

| Container | Access | Insert / erase | Notes |
| --- | --- | --- | --- |
| `vector` | O(1) index | O(1) amortised at the end, O(n) in the middle | Contiguous, cache-friendly, the default |
| `array` | O(1) index | Fixed size | Stack-allocated, no heap |
| `deque` | O(1) index | O(1) at both ends | No contiguity guarantee |
| `list` | O(n) | O(1) with an iterator | Linked list; `splice` is O(1) |
| `stack` | Top only | O(1) push / pop | Adaptor over `deque` |
| `queue` | Front and back | O(1) | Adaptor over `deque` |
| `priority_queue` | Top O(1) | O(log n) | Max-heap by default |
| `set` / `multiset` | O(log n) | O(log n) | Sorted; unique / duplicates |
| `unordered_set` | O(1) average | O(1) average | Hashed, O(n) worst case |
| `map` / `multimap` | O(log n) | O(log n) | Sorted by key |
| `unordered_map` | O(1) average | O(1) average | Hashed, O(n) worst case |

## vector

```cpp
vector<int> v;                                  // empty
vector<int> a(n, 0);                            // n zeros
vector<int> b = {1, 2, 3};
vector<vector<int>> grid(m, vector<int>(n, 0)); // m x n

v.push_back(x);                                 // O(1) amortised
v.pop_back();
v.resize(n);                                    // grow with zeros / shrink
v.assign(n, 0);
v.front(); v.back();
v.data();                                       // raw pointer, for C APIs
```

- `v[i]` does no bounds checking; `v.at(i)` throws `std::out_of_range`.
- `reserve(n)` before a loop of `push_back` avoids repeated reallocation.
- `vector<bool>` is a bitset specialisation — use `vector<char>` if you need real references.

## pair and tuple

```cpp
pair<int, int> p = {1, 2};
p.first; p.second;
auto [a, b] = p;                                // C++17 structured binding

tuple<int, string, double> t = {1, "x", 2.5};
get<0>(t);
```

`pair` sorts lexicographically by `first`, then `second`, so `vector<pair<int,int>>` needs no
comparator.

## stack, queue, deque, priority_queue

```cpp
stack<int> st;  st.push(x); st.top(); st.pop();          // no iteration
queue<int> q;   q.push(x);  q.front(); q.pop();
deque<int> dq;  dq.push_front(x); dq.push_back(x);       // O(1) both ends

priority_queue<int> maxHeap;                              // largest on top
priority_queue<int, vector<int>, greater<int>> minHeap;   // smallest on top
```

- `priority_queue` has no `clear()` — assign a fresh one or pop in a loop.
- A custom comparator returns `true` when `a` should come **after** `b` (max-heap semantics).

## set and map

```cpp
set<int> s = {3, 1, 2};         // sorted: 1 2 3
s.insert(4); s.erase(2); s.count(1); s.find(3);
auto it = s.lower_bound(2);      // first element >= 2
auto jt = s.upper_bound(2);      // first element > 2

map<string, int> freq;
freq["a"]++;                     // inserts {a, 0} if missing
freq.at("a");                    // throws if missing
for (auto& [key, value] : freq) { /* ... */ }
```

- `map[key]` **inserts** a default value when the key is absent — use `find` or `count` to read only.
- `unordered_map` / `unordered_set` are faster on average but can degrade to O(n) per operation, and
  custom key types need a hash.
- `set` / `map` keep keys sorted, so `lower_bound` / `upper_bound` work; the unordered versions have
  no ordering.

## Iterators and ranges

```cpp
for (int x : v) { }              // copy
for (int& x : v) { x *= 2; }     // mutate
v.begin(), v.end();              // [begin, end)
v.rbegin(), v.rend();            // reverse
```

Algorithms take half-open ranges `[first, last)`; `last` is one past the final element.

## Sorting algorithms

| Need | One-liner | Cost |
| --- | --- | --- |
| Ascending | `sort(v.begin(), v.end());` | O(n log n), unstable |
| Descending | `sort(v.begin(), v.end(), greater<int>());` | O(n log n) |
| Custom order | `sort(v.begin(), v.end(), [](int a, int b) { return a > b; });` | Comparator must be strict |
| Stable | `stable_sort(v.begin(), v.end());` | O(n log n), O(n) extra |
| k-th smallest | `nth_element(v.begin(), v.begin() + k, v.end());` | O(n) average |
| k smallest, sorted | `partial_sort(v.begin(), v.begin() + k, v.end());` | O(n log k) |
| Sorted check | `is_sorted(v.begin(), v.end());` | O(n) |
| Merge sorted | `merge(a.begin(), a.end(), b.begin(), b.end(), back_inserter(out));` | O(n + m) |

- `std::sort` is introsort (quick + heap + insertion): unstable, O(n log n) worst case.
- Comparators must return `false` for equal elements — use `<`, never `<=`.
- `nth_element` only guarantees position `k`; everything before is `<=` it and everything after is
  `>=` it.
- Java: `Arrays.sort(int[])` is dual-pivot quicksort (unstable); `Arrays.sort(Object[])` and
  `Collections.sort` are Timsort (stable).

## Searching algorithms

| Need | One-liner | Notes |
| --- | --- | --- |
| Binary search | `binary_search(v.begin(), v.end(), x);` | Sorted range, returns bool |
| First `>= x` | `lower_bound(v.begin(), v.end(), x);` | Iterator |
| First `> x` | `upper_bound(v.begin(), v.end(), x);` | Iterator |
| Count of `x` | `upper_bound(...) - lower_bound(...);` | O(log n) |
| Find value | `find(v.begin(), v.end(), x);` | O(n), `end()` if absent |
| Count value | `count(v.begin(), v.end(), x);` | O(n) |

## Modifying algorithms

| Need | One-liner |
| --- | --- |
| Reverse | `reverse(v.begin(), v.end());` |
| Rotate left by k | `rotate(v.begin(), v.begin() + k, v.end());` |
| Rotate right by k | `rotate(v.begin(), v.end() - k, v.end());` |
| Dedupe sorted | `v.erase(unique(v.begin(), v.end()), v.end());` |
| Remove value | `v.erase(remove(v.begin(), v.end(), x), v.end());` |
| Remove + fill | `fill(remove(v.begin(), v.end(), 0), v.end(), 0);` |
| Fill | `fill(v.begin(), v.end(), 0);` |
| Partition | `partition(v.begin(), v.end(), pred);` |
| Stable partition | `stable_partition(v.begin(), v.end(), pred);` |

`unique`, `remove` and `rotate` only move elements and return a new logical end — they never change
the container's size.

## Numeric and misc algorithms

```cpp
accumulate(v.begin(), v.end(), 0);                    // sum, O(n)
accumulate(v.begin(), v.end(), 0LL);                  // 64-bit seed avoids overflow
accumulate(v.begin(), v.end(), 1, multiplies<int>()); // product, <functional>
accumulate(v.begin(), v.end(), 0, bit_xor<int>());    // XOR fold, <functional>
*max_element(v.begin(), v.end());
*min_element(v.begin(), v.end());
iota(v.begin(), v.end(), 1);                          // 1, 2, 3, ...
next_permutation(v.begin(), v.end());                 // next lexicographic order
```

- The seed is the identity for the operation: `0` for `plus`, `1` for `multiplies`, `0` for
  `bit_xor`. Passing the wrong seed silently changes the result.
- `plus`, `multiplies`, `bit_xor` and friends live in `<functional>`.
- `accumulate`'s initial value decides the type; `0` sums in `int` and can overflow, so seed with
  `0LL` (or `1LL` for a product) when the result may be large.
- `next_permutation` returns `false` when it wraps to the first permutation.
- `gcd` / `lcm` live in `<numeric>`.

## Array problem shortcuts

The one-liners behind the **Arrays** note.

| Problem | One-liner |
| --- | --- |
| Second largest | `nth_element(v.begin(), v.begin() + 1, v.end(), greater<int>());` |
| k-th largest | `nth_element(v.begin(), v.begin() + k - 1, v.end(), greater<int>());` |
| Rotate left | `rotate(v.begin(), v.begin() + k, v.end());` |
| Rotate right | `rotate(v.begin(), v.end() - k, v.end());` |
| Move zeroes | `fill(remove(v.begin(), v.end(), 0), v.end(), 0);` |
| Remove duplicates | `v.erase(unique(v.begin(), v.end()), v.end());` |
| Missing number | `1LL * n * (n + 1) / 2 - accumulate(v.begin(), v.end(), 0LL);` |
| Union | `set_union(a.begin(), a.end(), b.begin(), b.end(), back_inserter(out));` |
| Intersection | `set_intersection(a.begin(), a.end(), b.begin(), b.end(), back_inserter(out));` |
| Majority candidate | `nth_element(v.begin(), v.begin() + v.size() / 2, v.end());` |

- `set_union` / `set_intersection` need sorted inputs and keep duplicates from both ranges; add
  `out.erase(unique(out.begin(), out.end()), out.end());` for distinct output.
- `nth_element` with `greater<int>()` puts the k-th **largest** at index `k - 1`.
- The majority candidate still needs verification with `count(...) > n / 2`.

## Gotchas

- The **erase-remove idiom**: `erase(remove(...), end())`. `remove` alone leaves the size unchanged.
- Erasing from a `vector` inside a loop invalidates iterators and costs O(n) per erase → O(n²).
- `map[key]` inserts; use `find` / `count` for lookups.
- `accumulate` with `0` overflows on large sums; seed with `0LL`.
- Comparators must be strict (`<`, not `<=`), or `sort` can crash or loop.
- `vector` iterators are invalidated by reallocation; indices stay valid.
- `set_union` and friends assume sorted inputs — they do not sort for you.
