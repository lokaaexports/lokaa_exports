// API route for generating product catalogues
// POST /api/admin/catalog/generate

import { CatalogueGenerationService } from '@/lib/admin/services/catalogue.service';
import { authenticateToken } from '@/lib/admin/auth/middleware';

export async function POST(request) {
  try {
    // Authenticate request
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      type = 'complete', // complete, category, selected, customer
      categoryId,
      products = [],
      customerData,
      sections = {
        about: true,
        business: true,
        services: true,
        workflow: true,
        certifications: true,
      },
    } = body;

    const service = new CatalogueGenerationService();

    let catalogueBlob;
    let fileName;

    switch (type) {
      case 'complete':
        catalogueBlob = await service.generateCompleteCatalogue({ products });
        fileName = `lokaa-complete-catalogue-${Date.now()}.pdf`;
        break;

      case 'category':
        if (!categoryId) {
          return Response.json(
            { error: 'Category ID required' },
            { status: 400 }
          );
        }
        catalogueBlob = await service.generateCategoryCatalogue(categoryId, products);
        fileName = `lokaa-${categoryId.toLowerCase()}-catalogue-${Date.now()}.pdf`;
        break;

      case 'customer':
        if (!customerData) {
          return Response.json(
            { error: 'Customer data required' },
            { status: 400 }
          );
        }
        catalogueBlob = await service.generateCustomerCatalogue(customerData, products);
        fileName = `lokaa-customer-catalogue-${Date.now()}.pdf`;
        break;

      case 'selected':
        if (!products.length) {
          return Response.json(
            { error: 'Products selection required' },
            { status: 400 }
          );
        }
        catalogueBlob = await service.generateCompleteCatalogue({ products });
        fileName = `lokaa-selected-products-${Date.now()}.pdf`;
        break;

      default:
        return Response.json(
          { error: 'Invalid catalogue type' },
          { status: 400 }
        );
    }

    // Get catalogue stats
    const stats = service.getStatistics();

    // In production, save to database and cloud storage
    // For now, return blob + metadata
    const arrayBuffer = await catalogueBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'X-Catalogue-Version': stats.version,
        'X-Catalogue-Pages': stats.pages.toString(),
        'X-Catalogue-Generated': stats.generated,
        'X-Catalogue-Type': type,
      },
    });
  } catch (error) {
    console.error('Catalogue generation error:', error);
    return Response.json(
      { error: 'Failed to generate catalogue', details: error.message },
      { status: 500 }
    );
  }
}

// GET for status checking
export async function GET(request) {
  return Response.json({
    status: 'ready',
    service: 'Catalogue Generation Service',
    version: '2.1',
    formats: ['complete', 'category', 'customer', 'selected'],
  });
}
