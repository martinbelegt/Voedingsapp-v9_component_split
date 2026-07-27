export function hasArrayData(value) {
  return Array.isArray(value) && value.length > 0;
}

export function decideInitialArrayAuthority({
  localValue,
  cloudResult,
  localChangedDuringLoad = false,
}) {
  if (localChangedDuringLoad) {
    const cloudValue = cloudResult.dailyLog ?? cloudResult.value;
    const hasNonEmptyCloud =
      cloudResult.status === "success" && hasArrayData(cloudValue);

    return {
      action: "keep-local",
      status: hasNonEmptyCloud ? "conflict" : "local-only",
      reason: "local-changed-during-load",
    };
  }

  if (cloudResult.status === "error" || cloudResult.status === "invalid") {
    return {
      action: "keep-local",
      status: "error",
      reason: cloudResult.status,
    };
  }

  if (cloudResult.status === "missing") {
    return {
      action: "keep-local",
      status: "local-only",
      reason: "cloud-missing",
    };
  }

  const localHasData = hasArrayData(localValue);
  const cloudValue = cloudResult.dailyLog ?? cloudResult.value;
  const cloudHasData = hasArrayData(cloudValue);

  if (localHasData && !cloudHasData) {
    return {
      action: "keep-local",
      status: "local-only",
      reason: "cloud-empty-local-non-empty",
    };
  }

  if (!localHasData && cloudHasData) {
    return {
      action: "use-cloud",
      status: "synced",
      reason: "cloud-non-empty-local-empty",
    };
  }

  if (!localHasData && !cloudHasData) {
    return {
      action: "use-cloud",
      status: "synced",
      reason: "both-empty",
    };
  }

  return {
    action: "compare-non-empty",
    status: "conflict",
    reason: "both-non-empty",
  };
}

export function areJsonValuesEqual(left, right) {
  try {
    return JSON.stringify(left) === JSON.stringify(right);
  } catch {
    return false;
  }
}

export function shouldAttemptMigration(cloudStatus, isEligible) {
  return cloudStatus === "missing" && !!isEligible;
}

export function canSaveAppData({
  cloudLoaded,
  hasHydratedCloudData,
  hasLocalUserChange,
}) {
  return (
    !!cloudLoaded &&
    (!!hasHydratedCloudData || !!hasLocalUserChange)
  );
}

export function interpretRevisionSaveResult(result) {
  if (result?.ok) {
    return { status: "synced", keepLocal: true, blockWrites: false };
  }

  if (result?.conflict) {
    return { status: "conflict", keepLocal: true, blockWrites: true };
  }

  return { status: "error", keepLocal: true, blockWrites: false };
}
