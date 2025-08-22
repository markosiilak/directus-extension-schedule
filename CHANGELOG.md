# Changelog

All notable changes to the `directus-extension-schedule` project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2025-08-22

### ✨ Added
- **Tabbed Interface**: New tabbed layout separating calendar and time selection for better organization
- **Improved Time Inputs**: Replaced browser time pickers with regular text inputs for more flexible time entry
- **Time Persistence**: Time values now persist and display correctly when reopening the calendar
- **Enhanced UX**: Better visual separation between date selection and time input workflows

### 🔧 Changed
- **Interface Layout**: Calendar and time sections are now organized in separate tabs
- **Time Input Type**: Changed from `type="time"` to `type="text"` for better user control
- **Display Logic**: Time values are now extracted directly from stored dates for consistent display
- **Tab Navigation**: Added tab buttons with active states and hover effects

### 🐛 Fixed
- **Time Display Issue**: Fixed time values not showing in main input field until calendar was opened
- **Time Persistence**: Resolved issue where time values were lost after saving and reopening
- **Input Synchronization**: Time input fields now properly reflect stored values

### 📱 UI/UX Improvements
- **Tab Design**: Clean, modern tab design with primary color highlighting for active tabs
- **Responsive Layout**: Better organization with proper spacing and visual hierarchy
- **Placeholder Text**: Added helpful placeholder text showing expected time format (HH:MM)
- **Visual Feedback**: Improved hover effects and active states for better user interaction

### 🏗️ Technical Improvements
- **State Management**: Better separation between local input state and stored data
- **Computed Properties**: Improved reactive data flow for time display
- **Event Handling**: More robust time update functions with proper validation
- **Code Organization**: Cleaner separation of concerns between calendar and time functionality

## [1.0.2] - 2025-07-31

### ✨ Added
- Initial release of the schedule extension
- Date range selection with calendar interface
- Time input support for start and end times
- Validation for date ranges (end after start, future dates)
- Multiple date display formats (short, medium, long, European, ISO, numeric)

### 🔧 Features
- Calendar popup with month navigation
- Date range selection with visual indicators
- Time input fields for precise scheduling
- Configurable validation rules
- Responsive design with Directus theme integration

## [1.0.1] - 2025-07-31

### 🔧 Changed
- Initial development version

## [1.0.0] - 2025-07-31

### ✨ Added
- Initial project setup
- Basic Directus extension structure
- Vue 3 composition API implementation
- TypeScript support
- Build configuration with Directus extension builder

---

## Installation

```bash
npm install directus-extension-schedule
```

## Usage

```javascript
// In your Directus collection configuration
{
  "interface": "directus-extension-schedule",
  "options": {
    "showTime": true,
    "validation": "end_after_start",
    "displayFormat": "numeric"
  }
}
```

## Support

- **Issues**: [GitHub Issues](https://github.com/markosiilak/directus-extension-schedule/issues)
- **Documentation**: [README.md](./README.md)
- **License**: MIT
