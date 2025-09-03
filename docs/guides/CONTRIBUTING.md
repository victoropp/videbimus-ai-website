# Contributing to Vidibemus AI

Thank you for your interest in contributing to Vidibemus AI! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a feature branch
4. Make your changes
5. Submit a pull request

## Development Setup

```bash
# Clone the repository
git clone https://github.com/victoroppp/vidibemus-ai.git
cd vidibemus-ai

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Set up database
npx prisma generate
npx prisma migrate dev

# Start development server
npm run dev
```

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Commit Messages

Follow conventional commits format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Maintenance tasks

Example: `feat: add AI model selection dropdown`

### Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Maintain minimum 80% code coverage

```bash
# Run tests
npm run test

# Run with coverage
npm run test:coverage
```

### Pull Request Process

1. **Update documentation** for any changed functionality
2. **Add tests** for new features
3. **Ensure CI passes** all checks
4. **Request review** from maintainers
5. **Address feedback** promptly

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] Branch is up-to-date with main

## Project Structure

```
src/
├── app/           # Next.js app directory
├── components/    # React components
├── lib/          # Utility libraries
├── types/        # TypeScript types
└── hooks/        # Custom React hooks
```

## Areas for Contribution

### Priority Areas
- Performance optimizations
- Accessibility improvements
- Documentation enhancements
- Test coverage increase
- Bug fixes

### Feature Requests
Please discuss new features in an issue before implementing.

## Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for public APIs
- Update deployment docs for infrastructure changes

## Questions?

- Open an issue for bugs or feature requests
- Contact the team at dev@videbimusai.com

## License

By contributing, you agree that your contributions will be licensed under the project's license.

Thank you for contributing to Vidibemus AI! 🚀