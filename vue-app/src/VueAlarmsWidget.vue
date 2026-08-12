<template>
  <Card>
    <template #title>System Alarms
       <Button v-if="alarms.length > 0" @click="acknowledgeAll">
          <i class="pi pi-check"></i>
          Acknowledge All
        </Button>
    </template>
    <template #content>
      

      <div v-if="alarms.length === 0" class="no-alarms p-text-secondary">
        <i class="pi pi-check-circle p-mr-2" style="color: #22c55e;"></i>
        <span>System operating normally. No active alarms.</span>
      </div>
  
      <div v-else class="alarm-list">
        <div v-for="(alarm, idx) in alarms" :key="idx" class="alarm-item">
          <div class="alarm-time p-text-secondary">{{ alarm.time }}</div>
          <div class="alarm-content">
            <Tag :value="alarm.status" :severity="getSeverity(alarm.status)" class="p-mb-2" />
            <p>{{ alarm.message }}</p>
          </div>
        </div>
      </div>
    </template>
    
  </Card>
</template>

<script lang="ts">
import { PropType } from 'vue';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Card from 'primevue/card';

export interface Alarm {
  status: 'Critical' | 'Warning' | 'Info',
  message: string,
  time: string
}

export default {
  name: 'VueAlarmsWidget',
  components: {
    Button,
    Tag, 
    Card
  },
  props: {
    alarms: {
      type: [Array, String] as PropType<Alarm[] | string>,
      default: () => []
    },
  },
  methods: {
    getSeverity(status: string) {
      if (status === 'Critical') return 'danger';
      if (status === 'Warning') return 'warning';
      return 'info';
    },
    acknowledgeAll() {
      this.$emit('acknowledge-all');
    }
  }
}
</script>

<style scoped>
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

h3 {
  margin: 0;
  font-weight: 600;
}

.no-alarms {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--text-color-secondary, #64748b);
}

.alarm-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alarm-item {
  display: flex;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--surface-border, #e2e8f0);
}
.alarm-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.alarm-time {
  font-size: 0.875rem;
  min-width: 70px;
  color: var(--text-color-secondary, #64748b);
}

.alarm-content p {
  margin: 0;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

::v-deep .p-tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}
</style>
