# Announcement System Usage Guide

## Multi-Line Text Support

The announcement system fully supports multi-line text formatting. Here are the methods to create multi-line announcements:

### Method 1: Natural Line Breaks (Recommended)
When using the announcement command, Discord will automatically preserve line breaks if you type them naturally:

```
!announce #general Hello everyone
This is line 2
IMPORTANT ANNOUNCEMENT
```

### Method 2: Escape Sequences
You can also use `\n` in your message for explicit line breaks:

```
!announce #general Hello everyone\nIMPORTANT ANNOUNCEMENT\nPlease read carefully
```

### Method 3: Slash Command with Text Box and Ping Selection
The `/announce` slash command provides a complete interactive experience:

```
/announce channel:#general
```

This will:
1. **Open a text box modal** where you can write your announcement with full multi-line support
2. **Show a preview** of your announcement after submission
3. **Display a dropdown menu** with ping options:
   - **No Ping** 🔇 - Send announcement without pinging anyone
   - **@everyone** 📢 - Ping all members in the server  
   - **@here** 🟢 - Ping all online members

## Features

- **Rich Embed Header**: Each announcement includes a professional header with server branding
- **Interactive Ping Selection**: Choose exactly who to notify with your announcement
- **Message Preview**: See your announcement before sending with ping selection
- **Timestamp**: Automatic timestamp showing when the announcement was made
- **Author Attribution**: Shows who made the announcement
- **Permission Control**: Requires `manage_messages` permission
- **Mention Support**: @everyone, @here, and role mentions work properly
- **Formatting Preservation**: All Discord markdown formatting is preserved

## Output Format

Each announcement creates:
1. A rich embed with announcement header and metadata
2. The actual message content with preserved formatting and line breaks
3. Optional ping (@everyone, @here, or none) based on your selection
4. Confirmation message to the command user

The slash command provides an interactive experience where you can preview your announcement and choose the appropriate ping level, ensuring maximum visibility and professional presentation while maintaining full text formatting capabilities.