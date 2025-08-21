<template>
  <div class="schedule-interface">
    <v-notice v-if="!startDateField || !endDateField" type="warning">
      Please configure the start and end date field names in the interface options.
    </v-notice>
    
    <div v-else class="schedule-fields">
      <div class="schedule-field">
        <label class="schedule-label">{{ startDateLabel }}</label>
        <v-field
          :field="startDateField"
          :collection="collection"
          :value="startDateValue"
          :disabled="disabled"
          :required="required"
          @input="updateStartDate" />
      </div>
      
      <div class="schedule-field">
        <label class="schedule-label">{{ endDateLabel }}</label>
        <v-field
          :field="endDateField"
          :collection="collection"
          :value="endDateValue"
          :disabled="disabled"
          :required="required"
          @input="updateEndDate" />
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
  showTime: false,
  required: false,
  validation: 'end_after_start'
});

const emit = defineEmits(['input']);

const api = useApi();

// Extract start and end date values from the main value
const startDateValue = computed(() => {
  if (!props.value || !props.startDateField) return null;
  return props.value[props.startDateField] || null;
});

const endDateValue = computed(() => {
  if (!props.value || !props.endDateField) return null;
  return props.value[props.endDateField] || null;
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
}

.schedule-label {
  font-weight: 500;
  color: var(--theme--foreground);
  font-size: 14px;
}

.validation-error {
  margin-top: 8px;
}
</style>
