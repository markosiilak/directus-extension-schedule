import { defineInterface } from "@directus/extensions-sdk";

import InterfaceComponent from "./interface.vue";

export default defineInterface({
  id: "schedule",
  name: "Schedule",
  icon: "schedule",
  description: "Schedule interface with start and end date fields",
  component: InterfaceComponent,
  types: ["json"],
  group: "relational",
  options: [
    {
      field: "startDateField",
      name: "Start Date Field",
      type: "string",
      meta: {
        width: "half",
        interface: "input",
        options: {
          placeholder: "start_date",
        },
        note: "Field name for the start date",
      },
      schema: {
        default_value: "start_date",
      },
    },
    {
      field: "endDateField",
      name: "End Date Field",
      type: "string",
      meta: {
        width: "half",
        interface: "input",
        options: {
          placeholder: "end_date",
        },
        note: "Field name for the end date",
      },
      schema: {
        default_value: "end_date",
      },
    },
    {
      field: "showTime",
      name: "Show Time",
      type: "boolean",
      meta: {
        width: "half",
        interface: "boolean",
        options: {
          label: "Include time selection",
        },
        note: "Whether to show time picker in addition to date",
      },
    },
    {
      field: "required",
      name: "Required",
      type: "boolean",
      meta: {
        width: "half",
        interface: "boolean",
        options: {
          label: "Both dates are required",
        },
        note: "Make start and end dates required fields",
      },
    },
    {
      field: "displayFormat",
      name: "Display Format",
      type: "string",
      meta: {
        width: "half",
        interface: "select-dropdown",
        options: {
          choices: [
            { text: "Short (Jan 7, 2025)", value: "short" },
            { text: "Medium (January 7, 2025)", value: "medium" },
            { text: "Long (Mon, January 7, 2025)", value: "long" },
            { text: "Numeric (04/08/2025)", value: "numeric" },
            { text: "European (07.01.2025)", value: "european" },
            { text: "ISO (2025-01-07)", value: "iso" },
          ],
          default: "numeric",
        },
        note: "Format for displaying dates in the input field",
      },
      schema: {
        default_value: "numeric",
      },
    },
    {
      field: "validation",
      name: "Validation",
      type: "string",
      meta: {
        width: "half",
        interface: "select-dropdown",
        options: {
          choices: [
            { text: "None", value: "none" },
            { text: "End date must be after start date", value: "end_after_start" },
            { text: "Start date must be in the future", value: "start_in_future" },
            { text: "Both validations", value: "both" },
          ],
          default: "end_after_start",
        },
        note: "Validation rules for the date fields",
      },
    },
  ],
});
