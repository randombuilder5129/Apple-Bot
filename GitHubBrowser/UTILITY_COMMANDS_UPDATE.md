# Utility Commands Update - Calculator Fixed

## Changes Made

### Calculator Command Enhanced
- **Security Improvement**: Replaced unsafe `eval()` with restricted evaluation
- **Input Validation**: Only allows mathematical characters (0-9, +, -, *, /, (, ), ^, %)
- **Exponentiation Support**: Added ^ operator (converts to ** for Python)
- **Error Handling**: Comprehensive error handling for all calculation scenarios
- **Result Formatting**: Automatic formatting for large numbers and scientific notation
- **Safe Functions**: Added support for abs, round, min, max, pow, sum functions

### Commands Removed
- **Translate Command**: Removed from help system (was not implemented)
- **Weather Command**: Removed from help system (was not implemented)

### Updated Help System
- Utility & Tools category updated from 19 to 17 commands
- Removed non-existent translate and weather commands from command list
- Calculator command now properly documented with enhanced features

## Calculator Features

### Supported Operations
- Basic arithmetic: +, -, *, /
- Parentheses for grouping: ( )
- Exponentiation: ^ (e.g., 2^3 = 8)
- Modulo: % (e.g., 10%3 = 1)
- Mathematical functions: abs, round, min, max, pow, sum

### Example Usage
- `!calc 2+2` → 4
- `!calc 2^8` → 256
- `!calc (5+3)*2` → 16
- `!calc 10/3` → 3.3333333333
- `!calc abs(-5)` → 5
- `!calc round(3.14159, 2)` → 3.14

### Security Features
- Restricted evaluation environment
- No access to system functions or file operations
- Input sanitization and validation
- Protected against code injection attempts

## Bot Status
All 13 cogs loaded successfully with updated utility commands ready for use.