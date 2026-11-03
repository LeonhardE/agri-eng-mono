# Repository Instructions

## Commit conventions

- Use `Xianxin <zxx9808181@gmail.com>` as the author for every commit.
- Credit Codex as a collaborator by adding `Co-authored-by: Codex <codex@openai.com>` to every commit message.
- Follow Conventional Commits 1.0.0 for every commit message.
- Every commit must include a scope identifying its service or client, such as `feat(web): ...`, `fix(listing): ...`, `feat(identity): ...`, or `feat(miniprogram): ...`.
- Use the target name for new services and independently deployed workers, such as `trade`, `payment`, or `notification`. Shared foundations use `shared`; repository-wide rules and tooling use `repo`.
- Infrastructure commits use the `infra` type and the affected target as their scope, such as `infra(listing): ...` or `infra(web): ...`.

## Change workflow

- Add one Markdown change record under `changelog/` for every material change, except changes confined to `local-doc/`.
- Creating, updating, or deleting local-only documentation in `local-doc/` does not require a changelog entry. For a mixed change, record only the material changes outside `local-doc/`.
- Follow the naming and content convention in `changelog/README.md`.
- Run `npm run check` from the repository root before committing.

## Local documentation conventions

- Keep product plans, architecture, roadmaps, UI design, costs, and operational planning in the Git-ignored `local-doc/` directory. Do not move them into tracked documentation.
- Every local document must have complete Chinese and English versions with the same base name, distinguished by `.cn.md` and `.en.md`.
- Keep both versions' structures and decisions synchronized whenever either is changed.
- Link the corresponding language version near the beginning of each document.
- Neither version may contain credentials, tokens, private keys, or secret values.
- Tracked repository instructions and change records follow the reference repository's English format; the bilingual pairing rule applies to local planning documents.

## Pull request scope

- Each new implementation PR must target exactly one backend service or frontend client (`apps/web` or `apps/miniprogram`). Do not combine multiple services or backend and frontend changes in one PR.
- Include the selected target's tests, dependency files, Docker configuration, service-specific deployment configuration, documentation, and required changelog in that PR as needed.
- Changes to shared libraries or contracts, repository-wide infrastructure, or workflow rules belong in separate foundation-only PRs. Do not bundle changes to their consuming services or frontend into those PRs.
- Deliver cross-service work through ordered, backward-compatible PRs: introduce shared prerequisites or producer APIs first, then update each consumer in its own PR. Each PR must be independently verifiable and safe to merge and deploy.
- Infrastructure provisioning follows the same single-target rule at both commit and PR level. Put each service or client's cloud resource configuration in its own infrastructure commit and PR.
- Shared infrastructure modules belong in a separate `infra(shared)` foundation PR; repository-wide state/bootstrap and execution tooling use `infra(repo)`. A shared scope must not bundle multiple services' resource instances.

## Current delivery boundary

- Only `apps/web` is implemented. The mini-program, services, shared packages, and cloud infrastructure have directory placeholders only. Add executable code or cloud resources only when requested.
- Demo listings, farm verification, and transaction requests are fictional and browser-local. Do not describe them as real authentication, notifications, payments, or reserved inventory.
- Services must not import each other's application code or write another service's data. Shared contracts must not become shared business logic or shared repositories.
