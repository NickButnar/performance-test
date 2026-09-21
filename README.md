# performance-test

A sandbox for measuring performance differences between competing React Native libraries. The app doesn't solve a product problem — it's a test bench where each library gets identical input data and identical UI, so that any difference in the numbers is explained by the library itself.

## What we compare

### Lists: FlatList vs FlashList

Two screens render the same long list from a public API. What we care about:

- FPS during fast scrolling
- time to first frame (screen opened → list visible)
- memory usage on long lists
- behavior when scrolling to the end and back (cell recycling)

### Forms: React Final Form vs React Hook Form

Two screens with an identical form. What we care about:

- number of re-renders per keystroke
- degradation as the field count grows
- cost of validation

## Measurement principles

To keep the comparison fair, rather than a comparison of two different implementations:

1. **Shared item component.** Both lists render the same cell. Otherwise you're measuring the markup, not the list.
2. **Shared data layer.** Both screens get their data through the same TanStack Query hook.
3. **Shared form schema.** Both forms use one field definition and one validation.

## Stack

|            |                                    |
| ---------- | ---------------------------------- |
| Expo SDK   | 57 (New Architecture, Hermes)      |
| Navigation | Expo Router (file-based)           |
| Data       | TanStack Query                     |
| Lists      | FlatList (RN), @shopify/flash-list |
| Forms      | react-final-form, react-hook-form  |

## Running

Requires a development build — `@shopify/flash-list` contains native code and doesn't work in Expo Go.

```sh
bun install
bun run ios       # or: bun run android
```

Checks:

```sh
bunx tsc --noEmit
bunx expo lint
bunx expo-doctor
```
