#!/usr/bin/env python3
"""
Thin wrapper around the JobSpy library.

Usage:
    python jobspy_search.py '<json-filters>'

Outputs a JSON array of job results to stdout.
"""

import sys
import json

# Maximum number of characters to include in a job description snippet
MAX_DESCRIPTION_LENGTH = 500


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No filters provided"}))
        sys.exit(1)

    try:
        filters = json.loads(sys.argv[1])
    except json.JSONDecodeError as exc:
        print(json.dumps({"error": f"Invalid JSON filters: {exc}"}))
        sys.exit(1)

    try:
        # Import is deferred so we can return a clear error when the package
        # is not installed, rather than crashing with a bare ImportError.
        from jobspy import scrape_jobs  # noqa: PLC0415
    except ImportError:
        print(json.dumps({"error": "JobSpy is not installed. Run: pip install -r requirements.txt"}))
        sys.exit(1)

    site_name = filters.get("jobBoards", ["linkedin", "indeed"])
    search_term = filters.get("jobTitle", "")
    location = filters.get("location", "")
    results_wanted = int(filters.get("resultsWanted", 20))
    company_name = filters.get("company") or None
    is_remote = filters.get("remote", False)

    # Build optional salary range filter
    min_amount = filters.get("salaryMin") or None
    max_amount = filters.get("salaryMax") or None

    try:
        jobs_df = scrape_jobs(
            site_name=site_name,
            search_term=search_term,
            location=location,
            results_wanted=results_wanted,
            is_remote=is_remote,
            **({"min_amount": min_amount} if min_amount is not None else {}),
            **({"max_amount": max_amount} if max_amount is not None else {}),
            **({"company": company_name} if company_name else {}),
        )
    except Exception as exc:
        print(json.dumps({"error": f"JobSpy scrape failed: {exc}"}))
        sys.exit(1)

    results = []
    for _, row in jobs_df.iterrows():
        salary_parts = []
        if row.get("min_amount") is not None:
            salary_parts.append(f"${int(row['min_amount']):,}")
        if row.get("max_amount") is not None:
            salary_parts.append(f"${int(row['max_amount']):,}")
        salary = " - ".join(salary_parts) if salary_parts else None

        date_posted = None
        if row.get("date_posted") is not None:
            date_posted = str(row["date_posted"])

        results.append({
            "id": str(row.get("id", "")),
            "title": str(row.get("title", "")),
            "company": str(row.get("company", "")),
            "location": str(row.get("location", "")),
            "salary": salary,
            "url": str(row.get("job_url", "")) or None,
            "source": str(row.get("site", "")),
            "datePosted": date_posted,
            "description": str(row.get("description", ""))[:MAX_DESCRIPTION_LENGTH] if row.get("description") else None,
        })

    print(json.dumps(results))


if __name__ == "__main__":
    main()
