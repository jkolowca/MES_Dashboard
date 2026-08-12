<template>
  <div class="hello-vue">
    <h3>Hello from Vue 2.7!</h3>
    <p>This is a custom Web Component embedded in Angular.</p>
    <div class="p-mt-3">
      <Button label="PrimeVue Button" icon="pi pi-check" />
    </div>
  </div>
</template>

<script>
import Button from 'primevue/button';

export default {
  name: 'HelloVue',
  components: {
    Button
  }
}
</script>

<style scoped>
.hello-vue {
  padding: 1rem;
  border: 1px solid var(--p-primary-color);
  border-radius: 8px;
  background-color: var(--p-primary-50);
  font-family: inherit;
  color: var(--p-text-color);
}
h3 {
  color: var(--p-primary-color);
  margin-top: 0;
  margin-bottom: 0.5rem;
}
p {
  margin: 0;
  margin-bottom: 1rem;
}
</style>
