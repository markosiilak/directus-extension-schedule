<template>
  <div class="schedule-interface">
    <div class="schedule-fields">
      <div class="schedule-field">
        <label class="schedule-label">{{ startDateLabel }}</label>
        <div class="date-input-wrapper">
          <input
            :value="startDateDisplay"
            :disabled="disabled"
            :required="required"
            type="text"
            :placeholder="showTime ? 'Select start date and time' : 'Select start date'"
            readonly
            class="date-input"
            @click="showStartCalendar = true" />
          <button 
            type="button" 
            :disabled="disabled"
            class="calendar-button"
            @click="showStartCalendar = true">
            📅
          </button>
        </div>
        
        <!-- Start Date Calendar Popup -->
        <div v-if="showStartCalendar" class="calendar-popup">
          <div class="calendar-header">
            <span>Select Start Date</span>
            <button class="close-button" @click="showStartCalendar = false">×</button>
          </div>
          <v-calendar
            v-model="startDateValue"
            :min-date="null"
            :max-date="endDateValue ? new Date(endDateValue) : null"
            :attributes="startDateAttributes"
            class="calendar"
            @dayclick="onStartDateSelect" />
          <div v-if="showTime" class="time-input">
            <label>Time:</label>
            <input 
              v-model="startTimeValue" 
              type="time"
              @change="updateStartDateTime" />
          </div>
        </div>
      </div>
      
      <div class="schedule-field">
        <label class="schedule-label">{{ endDateLabel }}</label>
        <div class="date-input-wrapper">
          <input
            :value="endDateDisplay"
            :disabled="disabled"
            :required="required"
            type="text"
            :placeholder="showTime ? 'Select end date and time' : 'Select end date'"
            readonly
            class="date-input"
            @click="showEndCalendar = true" />
          <button 
            type="button" 
            :disabled="disabled"
            class="calendar-button"
            @click="showEndCalendar = true">
            📅
          </button>
        </div>
        
        <!-- End Date Calendar Popup -->
        <div v-if="showEndCalendar" class="calendar-popup">
          <div class="calendar-header">
            <span>Select End Date</span>
            <button class="close-button" @click="showEndCalendar = false">×</button>
          </div>
          <v-calendar
            v-model="endDateValue"
            :min-date="startDateValue ? new Date(startDateValue) : null"
            :max-date="null"
            :attributes="endDateAttributes"
            class="calendar"
            @dayclick="onEndDateSelect" />
          <div v-if="showTime" class="time-input">
            <label>Time:</label>
            <input 
              v-model="endTimeValue" 
              type="time"
              @change="updateEndDateTime" />
          </div>
        </div>
      </div>
      
      <v-notice v-if="validationError" type="danger" class="validation-error">
        {{ validationError }}
      </v-notice>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '@directus/extensions-sdk';
import { computed, ref, watch } from 'vue';

interface Props {
  value?: any;
  disabled?: boolean;
  startDateField?: string;
  endDateField?: string;
  showTime?: boolean;
  required?: boolean;
  validation?: string;
  collection?: string;
}

const props = withDefaults(defineProps<Props>(), {
  startDateField: 'start_date',
  endDateField: 'end_date',
  showTime: false,
  required: false,
  validation: 'end_after_start'
});

const emit = defineEmits(['input']);

const api = useApi();

// Calendar state
const showStartCalendar = ref(false);
const showEndCalendar = ref(false);
const startTimeValue = ref('');
const endTimeValue = ref('');

// Extract start and end date values from the main value
const startDateValue = computed(() => {
  if (!props.value || !props.startDateField) return null;
  return props.value[props.startDateField] || null;
});

const endDateValue = computed(() => {
  if (!props.value || !props.endDateField) return null;
  return props.value[props.endDateField] || null;
});

// Display values for the input fields
const startDateDisplay = computed(() => {
  if (!startDateValue.value) return '';
  const date = new Date(startDateValue.value);
  if (isNaN(date.getTime())) return '';
  
  const formattedDate = date.toLocaleDateString();
  if (props.showTime && startTimeValue.value) {
    return `${formattedDate} ${startTimeValue.value}`;
  }
  return formattedDate;
});

const endDateDisplay = computed(() => {
  if (!endDateValue.value) return '';
  const date = new Date(endDateValue.value);
  if (isNaN(date.getTime())) return '';
  
  const formattedDate = date.toLocaleDateString();
  if (props.showTime && endTimeValue.value) {
    return `${formattedDate} ${endTimeValue.value}`;
  }
  return formattedDate;
});

// Calendar attributes for highlighting
const startDateAttributes = computed(() => [
  {
    key: 'start-date',
    highlight: { color: 'blue', fillMode: 'light' },
    dates: startDateValue.value ? new Date(startDateValue.value) : null
  }
]);

const endDateAttributes = computed(() => [
  {
    key: 'end-date',
    highlight: { color: 'red', fillMode: 'light' },
    dates: endDateValue.value ? new Date(endDateValue.value) : null
  }
]);

// Labels for the fields
const startDateLabel = computed(() => {
  return props.startDateField ? `${props.startDateField.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}` : 'Start Date';
});

const endDateLabel = computed(() => {
  return props.endDateField ? `${props.endDateField.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}` : 'End Date';
});

// Validation error state
const validationError = ref('');

// Update functions
const updateStartDate = (value: any) => {
  updateValue(props.startDateField!, value);
  validateDates();
};

const updateEndDate = (value: any) => {
  updateValue(props.endDateField!, value);
  validateDates();
};

const updateValue = (field: string, value: any) => {
  const newValue = {
    ...props.value,
    [field]: value
  };
  emit('input', newValue);
};

// Calendar event handlers
const onStartDateSelect = (day: any) => {
  const selectedDate = new Date(day.date);
  if (props.showTime && startTimeValue.value) {
    const [hours, minutes] = startTimeValue.value.split(':');
    selectedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  } else {
    selectedDate.setHours(0, 0, 0, 0);
  }
  
  updateValue(props.startDateField!, selectedDate.toISOString());
  showStartCalendar.value = false;
  validateDates();
};

const onEndDateSelect = (day: any) => {
  const selectedDate = new Date(day.date);
  if (props.showTime && endTimeValue.value) {
    const [hours, minutes] = endTimeValue.value.split(':');
    selectedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  } else {
    selectedDate.setHours(0, 0, 0, 0);
  }
  
  updateValue(props.endDateField!, selectedDate.toISOString());
  showEndCalendar.value = false;
  validateDates();
};

const updateStartDateTime = () => {
  if (startDateValue.value && startTimeValue.value) {
    const date = new Date(startDateValue.value);
    const [hours, minutes] = startTimeValue.value.split(':');
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    updateValue(props.startDateField!, date.toISOString());
    validateDates();
  }
};

const updateEndDateTime = () => {
  if (endDateValue.value && endTimeValue.value) {
    const date = new Date(endDateValue.value);
    const [hours, minutes] = endTimeValue.value.split(':');
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    updateValue(props.endDateField!, date.toISOString());
    validateDates();
  }
};

// Validation logic
const validateDates = () => {
  validationError.value = '';
  
  if (!props.validation || props.validation === 'none') return;
  
  const startDate = startDateValue.value;
  const endDate = endDateValue.value;
  
  if (!startDate || !endDate) return;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (props.validation === 'end_after_start' || props.validation === 'both') {
    if (end <= start) {
      validationError.value = 'End date must be after start date';
      return;
    }
  }
  
  if (props.validation === 'start_in_future' || props.validation === 'both') {
    const now = new Date();
    if (start <= now) {
      validationError.value = 'Start date must be in the future';
      return;
    }
  }
};

// Watch for value changes to re-validate
watch(() => props.value, validateDates, { deep: true });

// Initial validation
validateDates();
</script>

<style scoped>
.schedule-interface {
  padding: 8px 0;
}

.schedule-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.schedule-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}

.schedule-label {
  font-weight: 500;
  color: var(--theme--foreground);
  font-size: 14px;
}

.date-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--theme--border-normal);
  border-radius: 4px;
  background: var(--theme--background-normal);
  color: var(--theme--foreground);
  cursor: pointer;
  font-size: 14px;
}

.date-input:focus {
  outline: none;
  border-color: var(--theme--primary);
}

.calendar-button {
  padding: 8px 12px;
  background: var(--theme--background-accent);
  border: 1px solid var(--theme--border-normal);
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.calendar-button:hover {
  background: var(--theme--background-accent-hover);
}

.calendar-popup {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--theme--background-normal);
  border: 1px solid var(--theme--border-normal);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  padding: 16px;
  margin-top: 4px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-weight: 500;
  color: var(--theme--foreground);
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--theme--foreground-subdued);
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: var(--theme--foreground);
}

.calendar {
  margin-bottom: 16px;
}

.time-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-input label {
  font-size: 14px;
  color: var(--theme--foreground);
  font-weight: 500;
}

.time-input input {
  padding: 6px 8px;
  border: 1px solid var(--theme--border-normal);
  border-radius: 4px;
  background: var(--theme--background-normal);
  color: var(--theme--foreground);
  font-size: 14px;
}

.validation-error {
  margin-top: 8px;
}
</style>
