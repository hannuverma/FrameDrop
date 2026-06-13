# Contributing to FrameDrop

Thank you for your interest in contributing to FrameDrop! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions. We are committed to providing a welcoming and inspiring community for all.

## How to Contribute

### Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Create a new issue** with the bug label
3. **Include the following information:**
   - Clear, descriptive title
   - Detailed description of the bug
   - Steps to reproduce
   - Expected vs. actual behavior
   - Browser/environment information
   - Screenshots if applicable

### Suggesting Features

1. **Check open issues** to see if someone has suggested it
2. **Create an issue** with the enhancement label
3. **Describe:**
   - The use case/problem it solves
   - How it should work
   - Why it would be useful
   - Any implementation ideas

### Pull Requests

#### Before You Start
1. **Fork the repository** to your GitHub account
2. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Keep your branch updated** with the latest main:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

#### Development Guidelines

**Code Style:**
- Use consistent indentation (2 spaces for JS/CSS, 4 spaces for HTML)
- Follow existing code patterns in the repository
- Use meaningful variable and function names
- Add comments for complex logic
- Keep lines reasonably short (80-100 characters)

**JavaScript:**
```javascript
// ✅ Good
const handleUploadComplete = (data) => {
  if (!data.url) return null;
  
  // Process the upload
  const processedData = parseImageData(data);
  return processedData;
};

// ❌ Avoid
const upload = (d) => {
  // complex logic
}
```

**CSS:**
```css
/* ✅ Good */
.button-primary {
  background: var(--accent);
  padding: 12px 24px;
  border-radius: var(--radius-md);
  transition: background 0.2s ease;
}

/* ❌ Avoid */
.btn { background: purple; }
```

**HTML:**
- Use semantic HTML5 tags
- Keep proper indentation
- Include alt text for images
- Use descriptive IDs and classes

#### Making Changes

1. **Make your changes** in the feature branch
2. **Test thoroughly**:
   - Test your changes locally
   - Check responsive design across devices
   - Verify no console errors
   - Test on different browsers if possible

3. **Commit messages** should be:
   - Clear and descriptive
   - Use imperative mood ("Add feature" not "Added feature")
   - Reference issues when relevant
   
   ```bash
   git commit -m "Add image drag-and-drop to room gallery (#123)"
   ```

4. **Keep commits clean**:
   - One feature/fix per commit when possible
   - Use `git rebase` to clean up before submitting PR
   - Avoid merge commits in your PR

#### Submitting a Pull Request

1. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request** with:
   - Clear title describing the change
   - Reference to related issue(s): "Fixes #123"
   - Description of changes and why
   - Screenshots/GIFs for UI changes
   - Any testing notes

3. **PR Template:**
   ```markdown
   ## Description
   Brief description of what this PR does.

   ## Related Issues
   Closes #123

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation

   ## Testing Done
   - Tested in Chrome, Firefox
   - Verified mobile responsiveness
   - No console errors

   ## Screenshots (if applicable)
   ![alt text](link-to-image)
   ```

4. **Respond to feedback** - Maintainers may request changes
5. **Keep PR updated** - Rebase if main has changed

### Documentation

- Update README.md for feature changes
- Add JSDoc comments for complex functions
- Include inline comments for non-obvious logic
- Update API documentation if endpoints change

## Project Structure

```
FrameDrop/
├── FrameDrop/           # Legacy HTML pages
├── frontend/            # React application
│   ├── public/         # Static assets
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── styles/     # Stylesheets
│   │   └── utils/      # Helper functions
│   └── package.json
├── backend/            # Express server (if exists)
├── .gitignore
├── README.md
└── CONTRIBUTING.md
```

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/FrameDrop.git
cd FrameDrop

# Install dependencies
npm install

# Start development server
npm start

# Run tests (when available)
npm test

# Build for production
npm run build
```

## Commit Workflow

```bash
# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and commit
git add .
git commit -m "Add amazing feature"

# Keep up with main
git fetch origin
git rebase origin/main

# Push to your fork
git push origin feature/amazing-feature

# Open PR on GitHub
```

## What We Look For in PRs

✅ **Good PRs have:**
- Clear purpose and scope
- Well-written, tested code
- Descriptive commit messages
- Appropriate comments and documentation
- Responsive design consideration
- No breaking changes (unless discussed)
- Clean git history

❌ **Avoid:**
- Large PRs (keep them focused)
- Unrelated changes
- Code style inconsistencies
- Missing error handling
- No testing
- Merge conflicts

## Review Process

1. **Automated checks** run (linting, build, etc.)
2. **Code review** from maintainers
3. **Testing** verification
4. **Merge** once approved and all checks pass

## Questions?

- Open a discussion on GitHub
- Check existing issues for answers
- Ask in PR comments

## Recognition

Contributors will be recognized in:
- Pull request comments
- Project documentation
- Release notes

Thank you for making FrameDrop better! 🎉
