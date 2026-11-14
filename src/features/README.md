# Feature ownership

Create a feature folder only when implementing it. Own its api, components, pages, hooks, schemas and tests as needed. Export cross-feature capabilities through index.ts; never import another feature’s internals. Shared components and lib must never import features.
