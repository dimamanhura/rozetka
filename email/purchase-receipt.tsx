import { Order } from "@/types";
import {
  Body,
  Column,
  Head,
  Tailwind,
  Text,
  Section,
  Row,
  Html,
  Preview,
  Container,
  Heading,
  Img,
} from '@react-email/components';

PurchaseReceipt.PreviewProps = {
  order: {
    id: "e137820e-0592-4fa7-b85b-5e270a93ddef",
    userId: "290c449c-3d26-474e-8bec-f5094d4c4c2e",
    shippingAddress: {
      fullName: "Alex Wong",
      streetAddress: "Street 1",
      city: "Kyiv",
      postalCode: "12345",
      country: "Ukraine",
    },
    paymentMethod: "Stripe",
    itemsPrice: "99.95",
    totalPrice: "124.94",
    shippingPrice: "10",
    taxPrice: "14.99",
    isPaid: true,
    paidAt: new Date("2025-05-09T10:08:01.700Z"),
    isDelivered: true,
    deliveredAt: new Date("2025-05-09T10:09:40.501Z"),
    createdAt: new Date("2025-05-09T10:07:38.993Z"),
    orderItems: [
      {
        productId: "4ea19347-b58f-4f6f-b0f5-92d6592253e7",
        qty: 1,
        price: "99.95",
        name: "Calvin Klein Slim Fit Stretch Shirt",
        slug: "calvin-klein-slim-fit-stretch-shirt",
        image: "https://utfs.io/f/BLmxR3a2HkrRnaUYUEro1ROd30j5I24NamxU8lSAs79DYfTt"
      }
    ],
    user: {
      name: "Frusty Moran",
      email: "admin@example.com"
    }
  },
} satisfies OrderInformationProps;

type OrderInformationProps = {
  order: Order;
};

function PurchaseReceipt({ order }: { order: Order }) {
  return (
    <Html>
      <Preview>
        View order receipt
      </Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-white">
          <Container className="max-w-xl">
            <Heading>Purchase Receipt</Heading>
            <Section>
              <Row>
                <Column>
                  <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap">
                    Order ID
                  </Text>
                  <Text className="mt-0 mr-4">
                    {order.id.toString()}
                  </Text>
                </Column> 
                <Column>
                  <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap">
                    Purchase Date
                  </Text>
                  <Text className="mt-0 mr-4">
                    {order.createdAt.toDateString()}
                  </Text>
                </Column> 
                <Column>
                  <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap">
                    Price Paid
                  </Text>
                  <Text className="mt-0 mr-4">
                    ${order.totalPrice.toString()}
                  </Text>
                </Column> 
              </Row>
            </Section>

            <Section className="border border-solid border-gray-500 rounded-lg p-4 md:p-6 my-4">
              {order.orderItems.map(item => (
                <Row key={item.productId} className="mt-8">
                  <Column className="w-20">
                    <Img
                      width={80}
                      alt={item.name}
                      className="rounded"
                      src={item.image}
                    />
                  </Column>
                  <Column className="align-top">
                    {item.name} x {item.qty}
                  </Column>
                  <Column align="right" className="align-top">
                    ${item.price.toString()}
                  </Column>
                </Row>
              ))}

              {
                [
                  {
                    name: 'Items',
                    price: order.itemsPrice,
                  },
                  {
                    name: 'Tax',
                    price: order.taxPrice,
                  },
                  {
                    name: 'Shipping',
                    price: order.shippingPrice,
                  },
                  {
                    name: 'Total',
                    price: order.totalPrice,
                  }
                ].map(({ name, price }) => (
                  <Row key={name} className="py-1">
                    <Column align="right">{name}: </Column>
                    <Column align="right" width={70} className="alight-top">
                      <Text className="m-0">
                        ${price.toString()}
                      </Text>
                    </Column>
                  </Row>
                ))
              }
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default PurchaseReceipt;
