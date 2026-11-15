<template>
  <div class="risk-score">
    <div class="label">Risk Skoru</div>
    <div class="bar" :style="{width: score + '%', backgroundColor: color}"></div>
    <div class="value">{{ score }}%</div>
  </div>
</template>

<script>
export default {
  name: 'RiskScore',
  props: {
    score: { type: Number, required: true }
  },
  computed: {
    color() {
      if (this.score < 30) return '#4caf50'; // low risk (green)
      if (this.score < 70) return '#ffeb3b'; // medium (yellow)
      return '#f44336'; // high (red)
    }
  }
};
</script>

<style scoped>
.risk-score { font-family: Arial, sans-serif; margin: 8px 0; }
.label { font-size: 0.9rem; color: #555; }
.bar { height: 12px; transition: width 0.3s; }
.value { font-size: 0.8rem; color: #333; margin-top: 2px; }
</style>
