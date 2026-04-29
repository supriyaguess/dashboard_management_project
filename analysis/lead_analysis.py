"""
Lead Data Analysis Script
Connects to MongoDB, performs statistical analysis, and generates visualizations.

Requirements:
    pip install pymongo pandas matplotlib seaborn
"""

import sys
from datetime import datetime, timedelta

try:
    import pandas as pd
    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
    import seaborn as sns
    from pymongo import MongoClient
except ImportError:
    print("Installing required packages...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pymongo", "pandas", "matplotlib", "seaborn"])
    import pandas as pd
    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
    import seaborn as sns
    from pymongo import MongoClient

MONGO_URI = "mongodb://localhost:27017/lead_dashboard"

def fetch_leads():
    client = MongoClient(MONGO_URI)
    db = client["lead_dashboard"]
    leads = list(db["leads"].find({}, {"_id": 0}))
    client.close()
    return pd.DataFrame(leads)

def analyze(df):
    print("\n" + "="*60)
    print("  LEAD DATA ANALYSIS REPORT")
    print(f"  Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)

    print(f"\nTotal Leads       : {len(df)}")
    print(f"Date Range        : {df['createdAt'].min().date()} → {df['createdAt'].max().date()}")
    print(f"Avg Budget (₹)    : {df['budget'].mean():,.0f}")
    print(f"Total Budget (₹)  : {df['budget'].sum():,.0f}")

    print("\n── Status Breakdown ──────────────────────────────────")
    status_counts = df["status"].value_counts()
    for status, count in status_counts.items():
        pct = count / len(df) * 100
        bar = "█" * int(pct / 3)
        print(f"  {status:<12} {count:>4}  ({pct:5.1f}%)  {bar}")

    print("\n── Conversion Rate ───────────────────────────────────")
    converted = status_counts.get("Converted", 0)
    print(f"  Conversion Rate  : {converted / len(df) * 100:.1f}%")
    print(f"  Pipeline (Active): {(status_counts.get('New', 0) + status_counts.get('Interested', 0))}")

    print("\n── Top Cities ────────────────────────────────────────")
    for city, count in df["city"].value_counts().head(5).items():
        print(f"  {city:<15} {count:>4} leads")

    print("\n── Top Services ──────────────────────────────────────")
    for svc, count in df["service"].value_counts().head(5).items():
        print(f"  {svc:<20} {count:>4} leads")

    print("\n── Budget Analysis by Status ─────────────────────────")
    budget_stats = df.groupby("status")["budget"].agg(["mean", "min", "max"]).round(0)
    print(budget_stats.to_string())

    print("\n── Monthly Lead Volume ───────────────────────────────")
    df["month"] = pd.to_datetime(df["createdAt"]).dt.to_period("M")
    monthly = df.groupby("month").size()
    for period, count in monthly.tail(6).items():
        bar = "█" * count
        print(f"  {str(period):<10} {count:>4}  {bar}")

    return df

def plot(df):
    plt.style.use("seaborn-v0_8-whitegrid")
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle("Lead Dashboard Analytics", fontsize=16, fontweight="bold", y=1.01)

    colors = {"New": "#3b82f6", "Interested": "#f59e0b", "Converted": "#10b981", "Rejected": "#ef4444"}

    # 1. Status Pie
    status_counts = df["status"].value_counts()
    pie_colors = [colors.get(s, "#6b7280") for s in status_counts.index]
    axes[0, 0].pie(
        status_counts, labels=status_counts.index, colors=pie_colors,
        autopct="%1.1f%%", startangle=140, pctdistance=0.8
    )
    axes[0, 0].set_title("Status Distribution", fontweight="bold")

    # 2. City Bar Chart
    city_counts = df["city"].value_counts().head(8)
    bars = axes[0, 1].barh(city_counts.index[::-1], city_counts.values[::-1], color="#3b82f6", edgecolor="white")
    axes[0, 1].set_title("Top Cities", fontweight="bold")
    axes[0, 1].set_xlabel("Number of Leads")
    for bar in bars:
        axes[0, 1].text(bar.get_width() + 0.2, bar.get_y() + bar.get_height() / 2,
                        f"{int(bar.get_width())}", va="center", fontsize=9)

    # 3. Service Distribution
    svc_counts = df["service"].value_counts().head(6)
    bar_colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]
    axes[1, 0].bar(range(len(svc_counts)), svc_counts.values, color=bar_colors[:len(svc_counts)], edgecolor="white")
    axes[1, 0].set_xticks(range(len(svc_counts)))
    axes[1, 0].set_xticklabels(svc_counts.index, rotation=25, ha="right", fontsize=9)
    axes[1, 0].set_title("Service Distribution", fontweight="bold")
    axes[1, 0].set_ylabel("Number of Leads")

    # 4. Monthly Trend
    df["month"] = pd.to_datetime(df["createdAt"]).dt.to_period("M")
    monthly = df.groupby("month").size().reset_index(name="count")
    monthly["label"] = monthly["month"].astype(str)
    axes[1, 1].plot(monthly["label"], monthly["count"], marker="o", color="#3b82f6",
                    linewidth=2.5, markersize=7, markerfacecolor="white", markeredgewidth=2)
    axes[1, 1].fill_between(range(len(monthly)), monthly["count"], alpha=0.15, color="#3b82f6")
    axes[1, 1].set_xticks(range(len(monthly)))
    axes[1, 1].set_xticklabels(monthly["label"], rotation=25, ha="right", fontsize=9)
    axes[1, 1].set_title("Monthly Lead Trend", fontweight="bold")
    axes[1, 1].set_ylabel("Number of Leads")

    plt.tight_layout()
    output_path = "lead_analysis_report.png"
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    print(f"\n✅ Chart saved to: {output_path}")
    plt.show()

def main():
    print("Connecting to MongoDB...")
    try:
        df = fetch_leads()
    except Exception as e:
        print(f"❌ Could not connect to MongoDB: {e}")
        print("Make sure MongoDB is running and the backend has been seeded.")
        return

    if df.empty:
        print("No leads found. Run: node backend/seed.js")
        return

    df = analyze(df)
    plot(df)

if __name__ == "__main__":
    main()
