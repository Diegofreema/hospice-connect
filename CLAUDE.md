# Collaboration Rules

1. **Describe approach and wait for approval**: Before writing any code, describe your approach and wait for approval. Always ask clarifying questions before writing any code if requirements are ambiguous.
2. **Break down large tasks**: If a task requires changes to more than 3 files, stop and break it into smaller tasks first.
3. **Risk assessment and testing**: After writing code, list what could break and suggest tests to cover it.
4. **Reproduce bugs first**: When there’s a bug, start by writing a test that reproduces it, then fix it until the test passes.
5. **Update rules on correction**: Every time I correct you, add a new rule to the CLAUDE.md file so it never happens again.
6. **SOLID principles**: Always use SOLID principles when writing code.
7. **Best practices**: Always use best practices, make sure there are no memory leaks.

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->
