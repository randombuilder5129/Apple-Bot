# Apple Bot - Sticky Notes System Implementation

## Feature Overview

The sticky notes system automatically keeps important messages pinned to the bottom of channels by reposting them after every new message. This ensures critical information remains visible without cluttering the channel.

## Commands Available

### Primary Commands
- `!stickynote <message>` - Create or update a sticky note
- `!sticky <message>` - Alias for stickynote
- `!pin <message>` - Alternative alias

### Management Commands  
- `!removesticky` - Remove sticky note from channel
- `!unsticky` - Alias for removesticky
- `!removestickynote` - Alternative alias

### Information Commands
- `!liststicky` - List all sticky notes in the server
- `!stickystatus` - Alias for liststicky
- `!stickyinfo` - Alternative alias

### Slash Command
- `/stickynote <message>` - Create sticky note via slash command

## How It Works

### Automatic Reposting
1. When a new message is sent in a channel with a sticky note
2. Bot waits 1 second to avoid rate limiting
3. Deletes the previous sticky note message
4. Reposts the sticky note at the bottom of the channel
5. Updates internal tracking to prevent infinite loops

### Message Format
- Styled with gold embed color (#FFD700)
- Title: "📌 Sticky Note"
- Content: User's message
- Footer: Shows who created the sticky note with their avatar

### Permission Requirements
- Requires "Manage Messages" permission to create/remove sticky notes
- Bot needs permission to send messages and delete its own messages

## Technical Implementation

### Smart Loop Prevention
- Tracks last message ID per channel to avoid reposting loops
- Ignores bot messages to prevent conflicts
- Only reposts when genuine user messages are sent

### Memory Management
- Stores sticky notes in memory for fast access
- Format: `{channel_id: {'message': content, 'message_id': id, 'author_id': user_id}}`
- Automatic cleanup when sticky notes are removed

### Error Handling
- Graceful handling of missing permissions
- Automatic recovery from deleted sticky note messages
- User-friendly error messages for common issues

## Usage Examples

### Creating a Sticky Note
```
!stickynote Welcome to our server! Please read #rules before posting.
```
Result: Creates a gold embed that will repost after every message

### Using Slash Command
```
/stickynote message: Remember to be respectful to all members
```
Result: Same functionality with ephemeral confirmation

### Removing Sticky Note
```
!removesticky
```
Result: Deletes current sticky note and stops automatic reposting

### Listing All Sticky Notes
```
!liststicky
```
Result: Shows all sticky notes in the server with previews

## Advanced Features

### Command Message Cleanup
- Automatically deletes the command message when creating sticky notes
- Sends confirmation via DM to avoid channel clutter
- Falls back to temporary channel message if DM fails

### Multi-Server Support
- Each server maintains independent sticky notes
- Channel-specific sticky notes (one per channel)
- Cross-server isolation prevents conflicts

### Character Limit Validation
- Enforces 2000 character limit for Discord compatibility
- User-friendly error messages for oversized content
- Prevents embed breaking due to length

## Integration with Help System

Added to help system as new category:
- **📌 Sticky Notes (3)**: stickynote, removesticky, liststicky
- Included in main command count (now 278 total commands)
- Available via `!help sticky` for detailed information

## Security Features

### Permission Validation
- Requires "Manage Messages" permission for all operations
- Validates permissions for both prefix and slash commands
- Prevents unauthorized sticky note creation

### Rate Limiting Protection
- 1-second delay before reposting prevents rate limit issues
- Intelligent message tracking reduces unnecessary API calls
- Efficient memory usage for high-traffic servers

## Module Integration

### Cog Loading
- Added `cogs.stickynotes` to main.py loading sequence
- Automatically loaded with other bot modules
- Proper async setup and teardown handling

### Event Listeners
- `on_message` listener for automatic reposting
- Ignores bot messages and DM channels
- Efficient channel and message validation

## Future Enhancements Ready

The implementation supports future features:
- Database persistence for server restarts
- Multiple sticky notes per channel
- Scheduled sticky note updates
- Role-based permissions for sticky note management
- Webhook integration for external updates

## Command Count Update

Total bot commands now: **278**
- Original: 275 commands
- Added: 3 sticky note commands (stickynote, removesticky, liststicky)
- Plus aliases: sticky, pin, unsticky, removestickynote, stickystatus, stickyinfo
- Slash command: /stickynote

The sticky notes system is fully functional and integrated into Apple Bot's comprehensive command suite.