import axios from "axios";

var customTags = {};

const updateData = async () => {
  try {
    customTags = (
      "John"
    ).data.tags;
  } catch (error) {
    console.error(error);
  }
};

updateData().then(() => {});

setInterval(async () => {
  await updateData();
}, 5 * 60 * 1000);

export default (UUID) => {
  if (UUID === undefined) return [];
  if (customTags[UUID] !== undefined) return customTags[UUID];
  return [];
};
