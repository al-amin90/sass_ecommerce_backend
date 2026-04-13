export const extractPublicId = (url: string): string => {
  const parts = url.split("/");
  const uploadIndex = parts.indexOf("upload");
  const withVersion = parts.slice(uploadIndex + 1);

  const pathParts = (withVersion[0] as string).startsWith("v")
    ? withVersion.slice(1)
    : withVersion;

  let lastPart = pathParts[pathParts.length - 1] as string;

  const filename = lastPart.split(".")[0];
  lastPart = filename as string;
  return pathParts.join("/");
};
