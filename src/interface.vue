<template>
  <div class="schedule-interface">
    <div class="schedule-fields">
      <div class="schedule-field">
        <label class="schedule-label">Date Range</label>
        <div class="date-input-wrapper">
          <input
            :value="dateRangeDisplay"
            :disabled="disabled"
            :required="required"
            type="text"
            :placeholder="showTime ? 'Select date range and time' : 'Select date range'"
            class="date-input"
            readonly />
          <button 
            type="button" 
            :disabled="disabled"
            class="calendar-button"
            @click="openCalendar">
            📅
          </button>
        </div>
        
        <!-- Shared Calendar Popup -->
        <div v-if="showCalendar" class="calendar-popup">
          <div class="calendar-header">
            <span>Select Date Range</span>
            <button class="close-button" @click="showCalendar = false">×</button>
          </div>
          <div class="calendar-grid">
            <div class="calendar-nav">
              <button @click="previousMonth()">&lt;</button>
              <span>{{ currentMonthYear }}</span>
              <button @click="nextMonth()">&gt;</button>
            </div>
            <div class="calendar-days">
              <div class="calendar-day-header">
                <span v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day">{{ day }}</span>
              </div>
              <div class="calendar-day-grid">
                <div 
                  v-for="(day, index) in calendarDays" 
                  :key="`${day.dayNumber}-${day.otherMonth ? 'other' : 'current'}: 'current'}-${index}`"
                  :class="['calendar-day', { 
                    'other-month': day.otherMonth,
                    'start-date': day.isStartDate,
                    'end-date': day.isEndDate,
                    'in-range': day.inRange,
                    'disabled': day.disabled
                  }]"
                  @click="selectDate(day)">
                  {{ day.dayNumber }}
                </div>
              </div>
            </div>
            <div v-if="showTime" class="time-inputs">
              <div class="time-input">
                <label>Start Time:</label>
                <input 
                  v-model="startTimeValue" 
                  type="time"
                  @change="updateStartDateTime" />
              </div>
              <div class="time-input">
                <label>End Time:</label>
                <input 
                  v-model="endTimeValue" 
                  type="time"
                  @change="updateEndDateTime" />
              </div>
            </div>
            <div class="calendar-actions">
              <button @click="clearDates" class="clear-button">Clear</button>
              <button @click="applyDates" class="apply-button">Apply</button>
            </div>
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
  displayFormat?: string;
}

interface CalendarDay {
  date: Date;
  dayNumber: number;
  otherMonth: boolean;
  isStartDate: boolean;
  isEndDate: boolean;
  inRange: boolean;
  disabled: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  startDateField: 'start_date',
  endDateField: 'end_date',
  showTime: false,
  required: false,
  validation: 'end_after_start',
  displayFormat: 'numeric'
});

const emit = defineEmits(['input']);

const api = useApi();

// Calendar state
const showCalendar = ref(false);
const startTimeValue = ref('');
const endTimeValue = ref('');
const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());
const tempStartDate = ref<Date | null>(null);
const tempEndDate = ref<Date | null>(null);

// Extract start and end date values from the main value
const startDateValue = computed(() => {
  if (!props.value || !props.startDateField) return null;
  return props.value[props.startDateField] || null;
});

const endDateValue = computed(() => {
  if (!props.value || !props.endDateField) return null;
  return props.value[props.endDateField] || null;
});



// Calendar computed properties
const currentMonthYear = computed(() => {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];
  return `${monthNames[currentMonth.value]} ${currentYear.value}`;
});

const calendarDays = computed(() => {
  return generateCalendarDays(currentMonth.value, currentYear.value, tempStartDate.value, tempEndDate.value);
});

// Format date based on the displayFormat setting
const formatDateDisplay = (dateValue: string | null): string => {
  if (!dateValue) return '';
  
  const date = new Date(dateValue);
  
  switch (props.displayFormat) {
    case 'short':
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric'
      });
    case 'medium':
      return date.toLocaleDateString(undefined, { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric'
      });
    case 'long':
      return date.toLocaleDateString(undefined, { 
        weekday: 'short',
        month: 'long', 
        day: 'numeric', 
        year: 'numeric'
      });
    case 'european':
      // Format as dd.mm.yyyy
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    case 'iso':
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    case 'numeric':
    default:
      return date.toLocaleDateString(); // Default numeric format
  }
};

// Combined date range display
const dateRangeDisplay = computed(() => {
  if (!startDateValue.value && !endDateValue.value) return '';
  
  let display = '';
  
  if (startDateValue.value) {
    const startFormatted = formatDateDisplay(startDateValue.value);
    display += startFormatted;
    
    if (props.showTime && startTimeValue.value) {
      display += ` ${startTimeValue.value}`;
    }
  }
  
  if (endDateValue.value) {
    if (display) display += ' - ';
    
    const endFormatted = formatDateDisplay(endDateValue.value);
    display += endFormatted;
    
    if (props.showTime && endTimeValue.value) {
      display += ` ${endTimeValue.value}`;
    }
  } else if (startDateValue.value) {
    // Show placeholder for end date if only start date is selected
    display += ' - (select end date)';
  }
  
  return display;
});

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
const onStartDateSelect = (date: Date) => {
  updateValue(props.startDateField!, date.toISOString());
  validateDates();
};

const onEndDateSelect = (date: Date) => {
  updateValue(props.endDateField!, date.toISOString());
  validateDates();
};

// Calendar methods


// Calendar methods for single calendar approach
const openCalendar = () => {
  tempStartDate.value = startDateValue.value ? new Date(startDateValue.value) : null;
  tempEndDate.value = endDateValue.value ? new Date(endDateValue.value) : null;
  showCalendar.value = true;
};

const selectDate = (day: CalendarDay) => {
  if (day.disabled || day.otherMonth) return;
  
  const selectedDate = new Date(day.date);
  
  if (!tempStartDate.value || (tempStartDate.value && tempEndDate.value)) {
    // First selection or reset selection
    tempStartDate.value = selectedDate;
    tempEndDate.value = null;
  } else {
    // Second selection - check if it's after start date
    if (selectedDate > tempStartDate.value!) {
      tempEndDate.value = selectedDate;
    } else {
      // If selected date is before start date, swap them
      tempEndDate.value = tempStartDate.value;
      tempStartDate.value = selectedDate;
    }
  }
};

const clearDates = () => {
  tempStartDate.value = null;
  tempEndDate.value = null;
};

const applyDates = () => {
  if (tempStartDate.value) {
    let startDate = new Date(tempStartDate.value);
    let endDate = tempEndDate.value ? new Date(tempEndDate.value) : null;
    
    if (props.showTime) {
      if (startTimeValue.value) {
        const [hours, minutes] = startTimeValue.value.split(':');
        startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }
      if (endDate && endTimeValue.value) {
        const [hours, minutes] = endTimeValue.value.split(':');
        endDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }
    }
    
    // Always update start date
    updateValue(props.startDateField!, startDate.toISOString());
    
    // Update or clear end date
    if (endDate) {
      updateValue(props.endDateField!, endDate.toISOString());
    } else {
      // Clear end date if no end date is selected
      updateValue(props.endDateField!, null);
    }
    
    validateDates();
  }
  
  showCalendar.value = false;
};

const previousMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
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

// Calendar generation function
const generateCalendarDays = (month: number, year: number, startDate: any, endDate: any): CalendarDay[] => {
  const days: CalendarDay[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();
  
  // Previous month days
  const prevMonth = new Date(year, month, 0);
  const prevMonthDays = prevMonth.getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const date = new Date(year, month - 1, day);
    const isStart = startDate && date.toDateString() === new Date(startDate).toDateString();
    const isEnd = endDate && date.toDateString() === new Date(endDate).toDateString();
    const inRange = startDate && endDate && date > new Date(startDate) && date < new Date(endDate);
    
    days.push({
      date: date,
      dayNumber: day,
      otherMonth: true,
      isStartDate: isStart,
      isEndDate: isEnd,
      inRange: inRange,
      disabled: false
    });
  }
  
  // Current month days
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day);
    const isStart = startDate && date.toDateString() === new Date(startDate).toDateString();
    const isEnd = endDate && date.toDateString() === new Date(endDate).toDateString();
    const inRange = startDate && endDate && date > new Date(startDate) && date < new Date(endDate);
    
    days.push({
      date: date,
      dayNumber: day,
      otherMonth: false,
      isStartDate: isStart,
      isEndDate: isEnd,
      inRange: inRange,
      disabled: false
    });
  }
  
  // Next month days
  const remainingDays = 42 - days.length; // 6 rows * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    const isStart = startDate && date.toDateString() === new Date(startDate).toDateString();
    const isEnd = endDate && date.toDateString() === new Date(endDate).toDateString();
    const inRange = startDate && endDate && date > new Date(startDate) && date < new Date(endDate);
    
    days.push({
      date: date,
      dayNumber: day,
      otherMonth: true,
      isStartDate: isStart,
      isEndDate: isEnd,
      inRange: inRange,
      disabled: false
    });
  }
  
  return days;
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

.date-picker {
  width: 100%;
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
  font-size: 14px;
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

.calendar-grid {
  margin-bottom: 16px;
}

.calendar-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.calendar-nav button {
  background: var(--theme--background-accent);
  border: 1px solid var(--theme--border-normal);
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 14px;
}

.calendar-nav button:hover {
  background: var(--theme--background-accent-hover);
}

.calendar-days {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.calendar-day-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: 500;
  font-size: 12px;
  color: var(--theme--foreground-subdued);
}

.calendar-day-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  transition: background-color 0.2s;
}

.calendar-day:hover:not(.disabled) {
  background: var(--theme--background-accent);
}

.calendar-day.other-month {
  color: var(--theme--foreground-subdued);
}

.calendar-day.start-date {
  background: var(--theme--primary);
  color: white;
  border-radius: 4px 0 0 4px;
}

.calendar-day.end-date {
  background: var(--theme--primary);
  color: white;
  border-radius: 0 4px 4px 0;
}

.calendar-day.in-range {
  background: var(--theme--primary-subdued);
  color: var(--theme--primary);
}

.calendar-day.disabled {
  color: var(--theme--foreground-subdued);
  cursor: not-allowed;
  opacity: 0.5;
}

.time-input {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
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

.time-inputs {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.calendar-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  justify-content: flex-end;
}

.clear-button, .apply-button {
  padding: 8px 16px;
  border: 1px solid var(--theme--border-normal);
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.clear-button {
  background: var(--theme--background-normal);
  color: var(--theme--foreground);
}

.clear-button:hover {
  background: var(--theme--background-accent);
}

.apply-button {
  background: var(--theme--primary);
  color: white;
  border-color: var(--theme--primary);
}

.apply-button:hover {
  background: var(--theme--primary-hover);
}

.validation-error {
  margin-top: 8px;
}
</style>
