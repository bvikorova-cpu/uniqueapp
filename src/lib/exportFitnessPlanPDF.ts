import jsPDF from "jspdf";

/**
 * Export a generated FitSlim fitness plan (workout + meals + macros + tips) to PDF.
 */
export function exportFitnessPlanPDF(plan: any, details?: any) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  let y = margin;

  const ensure = (needed = 20) => {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const heading = (text: string, size = 14) => {
    ensure(size + 16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.setTextColor(60, 30, 130);
    doc.text(text, margin, y);
    y += size + 6;
    doc.setTextColor(40, 40, 40);
  };

  const body = (text: string, size = 10, indent = 0) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, pageW - margin * 2 - indent);
    for (const line of lines) {
      ensure(size + 4);
      doc.text(line, margin + indent, y);
      y += size + 4;
    }
  };

  // Cover header
  doc.setFillColor(120, 50, 200);
  doc.rect(0, 0, pageW, 92, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  const days = plan?.days ?? plan?.workout_plan?.days?.length ?? 30;
  doc.text("Your Personalized Fitness Plan", margin, 44);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`${plan?.plan_type ? String(plan.plan_type).toUpperCase() : "PLAN"}  ·  ${days} days`, margin, 66);
  doc.text(new Date(plan?.created_at || Date.now()).toLocaleDateString(), pageW - margin - 90, 66);
  y = 120;
  doc.setTextColor(40, 40, 40);

  if (plan?.summary) {
    heading("Summary");
    body(plan.summary);
    y += 6;
  }

  const d = details || plan?.plan_details || {};
  if (d.daily_calories || d.daily_protein_g) {
    heading("Daily Targets");
    body(
      [
        d.daily_calories ? `Calories: ${d.daily_calories} kcal` : null,
        d.daily_protein_g ? `Protein: ${d.daily_protein_g} g` : null,
        d.daily_carbs_g ? `Carbs: ${d.daily_carbs_g} g` : null,
        d.daily_fats_g ? `Fats: ${d.daily_fats_g} g` : null,
      ]
        .filter(Boolean)
        .join("   |   ")
    );
    y += 6;
  }

  const workoutDays = plan?.workout_plan?.days ?? [];
  if (workoutDays.length) {
    heading("Workout Plan", 16);
    for (const day of workoutDays) {
      heading(`Day ${day.day}: ${day.title ?? ""}`, 12);
      const metaBits = [
        day.duration_min ? `${day.duration_min} min` : null,
        day.calories_burned ? `${day.calories_burned} kcal` : null,
      ].filter(Boolean);
      if (metaBits.length) body(metaBits.join("  ·  "), 9);
      if (day.warmup) body(`Warm-up: ${day.warmup}`, 9);
      for (const ex of day.exercises ?? []) {
        body(`• ${ex.name} — ${ex.sets ?? "-"}x${ex.reps ?? "-"}${ex.rest_sec ? `, rest ${ex.rest_sec}s` : ""}`, 10, 10);
      }
      if (day.cooldown) body(`Cool-down: ${day.cooldown}`, 9);
      y += 8;
    }
  }

  const mealDays = plan?.meal_plan?.days ?? [];
  if (mealDays.length) {
    doc.addPage();
    y = margin;
    heading("Meal Plan", 16);
    for (const day of mealDays) {
      heading(`Day ${day.day}${day.total_calories ? ` — ${day.total_calories} kcal` : ""}`, 12);
      for (const [mealName, mealData] of Object.entries<any>(day.meals || {})) {
        body(
          `${mealName.replace(/_/g, " ")}: ${mealData?.name ?? ""}${mealData?.calories ? ` (${mealData.calories} kcal${mealData?.protein_g ? `, ${mealData.protein_g}g protein` : ""})` : ""}`,
          10,
          10
        );
        if (mealData?.ingredients?.length) body(mealData.ingredients.join(", "), 9, 22);
      }
      y += 8;
    }
  }

  const tips = d.tips ?? plan?.tips;
  if (Array.isArray(tips) && tips.length) {
    heading("Tips for Success", 14);
    tips.forEach((t: string) => body(`• ${t}`, 10, 10));
  }

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text(`Page ${i} / ${pages}  ·  Unique — Personalized Fitness Plan`, pageW / 2, pageH - 20, { align: "center" });
  }

  doc.save(`fitness-plan-${plan?.plan_type ?? "custom"}-${Date.now()}.pdf`);
}
