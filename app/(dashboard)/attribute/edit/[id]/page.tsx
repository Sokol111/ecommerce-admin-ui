import { getAttributeById } from '@/lib/client/attribute-client';
import AttributeEdit from '../../_components/AttributeEdit';

export default async function EditAttributePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const attribute = await getAttributeById(id);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">Edit Attribute</h1>
      <AttributeEdit attribute={attribute} />
    </div>
  );
}
