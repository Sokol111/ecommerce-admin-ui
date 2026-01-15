import AttributeEdit from '../_components/AttributeEdit';

export default async function CreateAttributePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">Create Attribute</h1>
      <AttributeEdit />
    </div>
  );
}
