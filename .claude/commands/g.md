---
description: Git commit and push changes with AI-generated commit message
---

You are tasked with committing and pushing the current changes to git.

Follow these steps:

1. Run `git status` and `git diff` to see what has changed
2. Review all the changes carefully
3. Generate a clear, descriptive commit message that:
   - Summarizes the main changes
   - Uses conventional commit format if applicable (feat:, fix:, docs:, etc.)
   - Includes bullet points for multiple changes
   - Is concise but informative
4. Stage all changes with `git add -A`
5. Commit with the generated message (include the Claude Code footer)
6. Push to the remote repository

Important:
- Always review changes before committing
- Make sure tests pass before pushing (run `pnpm test` if applicable)
- Do NOT commit sensitive files (.env, credentials, etc.)
- If there are no changes, inform the user

Commit message format:
```
<type>: <short description>

<detailed description if needed>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```
