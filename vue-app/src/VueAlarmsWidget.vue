<template>
  <Card>
    <template #title>
      <div class="header">
        {{ title }}
        <Button v-if="alarms.length > 0" @click="acknowledgeAll" :label="ackLabel" icon="pi pi-check" class="p-button-text" />
      </div>
    </template>
    <template #content>
      <div v-if="alarms.length === 0" class="no-alarms p-text-secondary">
        <i class="pi pi-check-circle p-mr-2" style="color: #22c55e;"></i>
        <span>{{ emptyMessage }}</span>
      </div>
  
      <div v-else class="alarm-list">
        <div v-for="(alarm, idx) in alarms" :key="idx" class="alarm-item">
          <div class="alarm-time p-text-secondary">{{ alarm.time }}</div>
          <div class="alarm-content">
            <Tag :value="alarm.statusLabel" :severity="alarm.statusType" class="p-mb-2" />
            <p>{{ alarm.alarmMessage }}</p>
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
  statusType: 'danger' | 'warning' | 'info',
  statusLabel: string,
  alarmMessage: string,
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
      type: Array as PropType<Alarm[]>,
      default: () => []
    },
    title: {
      type: String,
      default: 'System Alarms'
    },
    ackLabel: {
      type: String,
      default: 'Acknowledge All'
    },
    emptyMessage: {
      type: String,
      default: 'System operating normally. No active alarms.'
    }
  },
  methods: {
    acknowledgeAll() {
      this.$emit('acknowledge-all');
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: .5rem;
  flex-wrap: wrap;
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
