# Plan: X-Post (Twitter) Upload Support

## Overview

Add X-post (Twitter) upload functionality to the RAGUI client to allow users to upload X/Twitter posts as context for the RAG system.

## Backend Reference

The backend already supports X-post uploading via the `/prompt/<ID>/uploadx` endpoint:

- **Endpoint**: `POST /prompt/<ID>/uploadx?url=<x-post-url>`
- **Supported URL formats**:
  - `https://x.com/username/status/1234567890`
  - `https://twitter.com/username/status/1234567890`
- **Required**: X API Bearer Token in environment variable (`X_API_KEY` or `TWITTER_BEARER_TOKEN`)

## Current Implementation

The [`Upload.jsx`](client/src/components/Upload.jsx:1) component currently supports:
1. **File upload** - Uses `/upload` endpoint with FormData
2. **URL upload** - Uses `/uploadurl` endpoint with query parameter

## Proposed Changes

### 1. Add X-Post Input Type

Modify [`Upload.jsx`](client/src/components/Upload.jsx:1) to include a third input type for X-posts:

- Extend the `inputType` state from `"file" | "url"` to `"file" | "url" | "xpost"`
- Add a third toggle button: "Switch to X-post"
- Add URL validation specific to X/Twitter URLs

### 2. Implement X-Post Upload Handler

Add a new handler that:
- Validates the URL matches X/Twitter post format
- Calls the `/uploadx` endpoint instead of `/uploadurl`
- Handles success/error responses appropriately

### 3. URL Validation

Add validation for X-post URLs:
- Must be HTTPS
- Must match pattern: `x.com/.../status/...` or `twitter.com/.../status/...`
- Extract username and status ID for verification

### 4. Display Updates

- Update status message to show "Uploading X-post..." during upload
- Display appropriate success/error messages

## Implementation Steps

1. **Modify state management** in `Upload.jsx`:
   - Update `inputType` state type
   - Add `existingXPosts` state for tracking uploaded X-posts

2. **Add X-post form** in the JSX:
   - Create input field with placeholder for X-post URL
   - Update button labels and toggle logic

3. **Implement URL validation**:
   - Create `isValidXPostUrl()` function
   - Check URL format before submission

4. **Add X-post upload handler**:
   - Create `handleXPostSubmit()` function
   - Call `/uploadx` endpoint with URL parameter
   - Handle response and call `onUpload` callback

5. **Optional: List existing X-posts**:
   - Similar to how URLs are listed, fetch and display previously uploaded X-posts
   - May need backend support for listing X-posts separately

### Storage Strategy

**Decision: Store X-posts in the same `urls.json` file as regular URLs**

This approach:
- Simplifies backend storage (single file)
- Uses existing `/context?file=urls.json&action=list` endpoint
- Allows listing all uploaded URLs (both regular and X-posts) together
- Requires no additional backend changes

The X-post URLs can be stored as-is in the urls.json array, and the UI can display them with an X/Twitter icon to distinguish them from regular URLs.

## Files to Modify

| File | Changes |
|------|---------|
| `client/src/components/Upload.jsx` | Main implementation |
| `client/src/components/Message.jsx` | Optional: Display X-post indicator in chunk view |

## Considerations

- **Backend requirement**: Ensure the RAG backend has `X_API_KEY` or `TWITTER_BEARER_TOKEN` configured
- **Error handling**: Handle cases where X API key is not configured (backend will return error)
- **User experience**: Clear placeholder text indicating the expected URL format
- **Backward compatibility**: Existing file and URL upload features should remain unchanged
