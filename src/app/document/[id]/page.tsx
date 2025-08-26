import React from "react";

const Document = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return (
    <div>
      <div>{id}</div>
    </div>
  );
};

export default Document;
