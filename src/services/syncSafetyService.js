export function hasArrayData(value) {
  return Array.isArray(value) && value.length > 0;
}

export function isJsonSubset(localValue, cloudValue) {
  if (Object.is(localValue, cloudValue)) return true;

  if (Array.isArray(localValue)) {
    if (!Array.isArray(cloudValue)) return false;

    const unmatchedCloudIndexes = new Set(cloudValue.map((_, index) => index));

    return localValue.every((localItem) => {
      for (const index of unmatchedCloudIndexes) {
        if (isJsonSubset(localItem, cloudValue[index])) {
          unmatchedCloudIndexes.delete(index);
          return true;
        }
      }

      return false;
    });
  }

  if (
    localValue &&
    cloudValue &&
    typeof localValue === "object" &&
    typeof cloudValue === "object"
  ) {
    return Object.keys(localValue).every(
      (key) =>
        Object.prototype.hasOwnProperty.call(cloudValue, key) &&
        isJsonSubset(localValue[key], cloudValue[key]),
    );
  }

  return false;
}

export function decideInitialArrayAuthority({
  localValue,
  cloudResult,
  localChangedDuringLoad = false,
  localKnownRevision = null,
  localDirty = false,
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

  const cloudRevision = cloudResult.revision;
  const hasReliableRevisions =
    Number.isInteger(localKnownRevision) && Number.isInteger(cloudRevision);

  if (
    hasReliableRevisions &&
    cloudRevision > localKnownRevision &&
    !localDirty
  ) {
    return {
      action: "use-cloud",
      status: "synced",
      reason: "newer-cloud-revision-clean-local",
    };
  }

  if (
    !Number.isInteger(localKnownRevision) &&
    Number.isInteger(cloudRevision) &&
    isJsonSubset(localValue, cloudValue)
  ) {
    return {
      action: "use-cloud",
      status: "synced",
      reason: "cloud-superset-safe-revision-bootstrap",
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
