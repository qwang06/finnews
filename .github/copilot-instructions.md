# Copilot Instructions

## Project Overview

The objective of this application is to retrieve finance news and information, then utilize a finance-trained LLM model to generate detailed reports.

## Architecture

This is an **Nx monorepo** with a clear separation between frontend and backend:

- **Frontend**: React application (TypeScript)
- **Backend**: Python application
- **Monorepo Tool**: Nx for task orchestration, caching, and dependency management

## Environment & Tech Stack

### Frontend

- **Framework**: React 19 with React Router 7
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Package Manager**: npm
- **Testing**: Vitest, Playwright (E2E)

### Backend

- **Language**: Python
- **Environment Management**: `venv`
- **Package Manager**: `pip`
- **Data Sources**: External APIs and Web Scraping

### Monorepo Management

- **Tool**: Nx
- **Task Execution**: Use `nx` commands (e.g., `nx build`, `nx test`, `nx run-many`)
- **Project Structure**: Apps and libraries under `apps/` directory

## Core Principles

**IMPORTANT**: Always adhere to **Clean Code** fundamentals. This is a critical requirement for this project.

### Clean Code Guidelines

**General Rules**

- Follow standard conventions.
- **Keep it simple stupid (KISS)**. Simpler is always better. Reduce complexity as much as possible.
- **Boy scout rule**: Leave the campground cleaner than you found it.
- **Always find root cause**: Always look for the root cause of a problem.

**Design Rules**

- Keep configurable data at high levels.
- Prefer polymorphism to if/else or switch/case.
- Separate multi-threading code.
- Prevent over-configurability.
- Use dependency injection.
- **Follow Law of Demeter**: A class should know only its direct dependencies.

**Understandability Tips**

- **Be consistent**: If you do something a certain way, do all similar things in the same way.
- Use explanatory variables.
- **Encapsulate boundary conditions**: Put the processing for them in one place.
- Prefer dedicated value objects to primitive types.
- **Avoid logical dependency**: Don't write methods which work correctly depending on something else in the same class.
- Avoid negative conditionals.

**Naming Rules**

- Choose descriptive and unambiguous names.
- Make meaningful distinctions.
- Use pronounceable names.
- Use searchable names.
- Replace magic numbers with named constants.
- **Avoid encodings**: Don't append prefixes or type information.

**Function Rules**

- Small.
- Do one thing.
- Use descriptive names.
- Prefer fewer arguments.
- Have no side effects.
- **Don't use flag arguments**: Split method into several independent methods.

**Comment Rules**

- Always try to explain yourself in code first.
- Don't be redundant.
- Don't add obvious noise.
- Don't use closing brace comments.
- **Don't comment out code**: Just remove it.
- Use as explanation of intent, clarification of code, or warning of consequences.

**Source Code Structure**

- Separate concepts vertically.
- Related code should appear vertically dense.
- Declare variables close to their usage.
- Dependent functions should be close.
- Similar functions should be close.
- Place functions in the downward direction.
- Keep lines short.
- Don't use horizontal alignment.
- Use white space to associate related things and disassociate weakly related.
- Don't break indentation.

**Objects and Data Structures**

- Hide internal structure.
- Prefer data structures.
- Avoid hybrid structures (half object and half data).
- Should be small.
- Do one thing.
- Small number of instance variables.
- Base class should know nothing about their derivatives.
- Prefer non-static methods to static methods.

**Tests**

- One assert per test.
- Readable.
- Fast.
- Independent.
- Repeatable.

**Code Smells to Avoid**

- **Rigidity**: The software is difficult to change.
- **Fragility**: The software breaks in many places due to a single change.
- **Immobility**: You cannot reuse parts of the code in other projects.
- **Needless Complexity**.
- **Needless Repetition**.
- **Opacity**: The code is hard to understand.
