def calculate_risk_score(financials, price_data, profile):
    score = 0
    reasons = []

    # --- Revenue Growth ---
    if financials and len(financials) >= 2:
        latest_revenue = financials[0]["revenue"]
        previous_revenue = financials[1]["revenue"]

        if latest_revenue and previous_revenue and previous_revenue > 0:
            growth = (latest_revenue - previous_revenue) / previous_revenue * 100

            if growth > 10:
                score += 2
                reasons.append(f"Strong revenue growth of {growth:.1f}%")
            elif growth > 0:
                score += 1
                reasons.append(f"Modest revenue growth of {growth:.1f}%")
            else:
                score -= 1
                reasons.append(f"Revenue declined by {abs(growth):.1f}%")

    # --- Profit Margin ---
    if financials and financials[0]["revenue"] and financials[0]["net_income"]:
        margin = financials[0]["net_income"] / financials[0]["revenue"] * 100

        if margin > 20:
            score += 2
            reasons.append(f"Strong profit margin of {margin:.1f}%")
        elif margin > 10:
            score += 1
            reasons.append(f"Healthy profit margin of {margin:.1f}%")
        elif margin > 0:
            reasons.append(f"Thin profit margin of {margin:.1f}%")
        else:
            score -= 2
            reasons.append(f"Company is operating at a loss")

    # --- 52 Week Price Performance ---
    if price_data:
        high = price_data.get("fifty_two_week_high")
        low = price_data.get("fifty_two_week_low")
        current = price_data.get("price")

        if high and low and current and high > low:
            position = (current - low) / (high - low) * 100

            if position > 70:
                score += 1
                reasons.append(f"Stock trading near 52-week high ({position:.0f}% of range)")
            elif position < 30:
                score -= 1
                reasons.append(f"Stock trading near 52-week low ({position:.0f}% of range)")
            else:
                reasons.append(f"Stock trading in mid-range ({position:.0f}% of 52-week range)")

    # --- Determine Risk Label ---
    if score >= 4:
        label = "Low Risk"
        color = "green"
    elif score >= 1:
        label = "Moderate Risk"
        color = "yellow"
    else:
        label = "Elevated Risk"
        color = "red"

    return {
        "score": score,
        "label": label,
        "color": color,
        "reasons": reasons,
    }