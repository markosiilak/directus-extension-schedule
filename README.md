# Directus Schedule Interface Extension

A Directus extension that provides a schedule interface with start and end date fields, including validation and time options.

## Features

- **Dual Date Fields**: Configure custom field names for start and end dates
- **Time Support**: Optional time picker for more precise scheduling
- **Validation Rules**: Built-in validation for date logic
- **Flexible Configuration**: Customizable field names and validation options
- **Responsive Design**: Clean, modern interface that works on all devices

## Installation

### From NPM (Recommended)
```bash
npm install @your-org/directus-extension-schedule
```

### Manual Installation
1. Clone this repository
2. Run `npm install`
3. Run `npm run build`
4. Copy the `dist` folder to your Directus extensions directory

## Configuration

The interface supports the following options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `startDateField` | string | - | Field name for the start date |
| `endDateField` | string | - | Field name for the end date |
| `showTime` | boolean | false | Whether to show time picker |
| `required` | boolean | false | Make both dates required |
| `validation` | string | 'end_after_start' | Validation rules to apply |

### Validation Options

- `none`: No validation
- `end_after_start`: End date must be after start date
- `start_in_future`: Start date must be in the future
- `both`: Apply both validations

## Usage

1. Create a new field in your collection
2. Set the field type to "JSON" or "Alias"
3. Choose "Schedule" as the interface
4. Configure the start and end date field names
5. Set your preferred validation rules

## Development

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Development mode with watch
npm run dev

# Link to local Directus instance
npm run link
```

## Requirements

- Directus 11.0.0 or higher
- Node.js 18+ (for development)

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions, please use the GitHub issue tracker.
