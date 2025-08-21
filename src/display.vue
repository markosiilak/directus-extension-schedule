<template>
  <div class="schedule-display">
    <span v-if="dateRangeText" class="date-range">{{ dateRangeText }}</span>
    <span v-else class="no-dates">No dates set</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  value?: any;
  startDateField?: string;
  endDateField?: string;
  showTime?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  startDateField: 'start_date',
  endDateField: 'end_date',
  showTime: false
});

// Extract start and end date values from the main value
const startDateValue = computed(() => {
  if (!props.value || !props.startDateField) return null;
  return props.value[props.startDateField] || null;
});

const endDateValue = computed(() => {
  if (!props.value || !props.endDateField) return null;
  return props.value[props.endDateField] || null;
});

// Format date in a consistent, readable way
const formatDate = (dateValue: string | null): string => {
  if (!dateValue) return '';
  
  const date = new Date(dateValue);
  
  if (props.showTime) {
    // Show date and time: "Jan 7, 2025 2:30 PM"
    return date.toLocaleString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  } else {
    // Show date only: "Jan 7, 2025"
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  }
};

// Combined date range display for table views
const dateRangeText = computed(() => {
  const startFormatted = formatDate(startDateValue.value);
  const endFormatted = formatDate(endDateValue.value);
  
  if (startFormatted && endFormatted) {
    // Both dates: "Jan 7, 2025 - Jan 10, 2025"
    return `${startFormatted} - ${endFormatted}`;
  } else if (startFormatted) {
    // Start only: "Jan 7, 2025 - ..."
    return `${startFormatted} - ...`;
  } else if (endFormatted) {
    // End only: "... - Jan 10, 2025"
    return `... - ${endFormatted}`;
  }
  
  return '';
});
</script>

<style scoped>
.schedule-display {
  font-family: var(--theme--fonts--sans--font-family);
  font-size: 14px;
  line-height: 1.4;
}

.date-range {
  color: var(--theme--foreground);
  white-space: nowrap;
  font-weight: 500;
}

.no-dates {
  color: var(--theme--foreground-subdued);
  font-style: italic;
  font-size: 13px;
}

/* Responsive for smaller table cells */
@media (max-width: 768px) {
  .schedule-display {
    font-size: 13px;
  }
  
  .date-range {
    font-weight: 400;
  }
}
</style>
