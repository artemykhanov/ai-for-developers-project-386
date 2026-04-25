import { AppShell, Anchor, Badge, Burger, Container, Group, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import PublicBookingPage from './pages/PublicBookingPage';

export default function App() {
  const [opened, { toggle, close }] = useDisclosure(false);

  return (
    <AppShell header={{ height: 68 }} navbar={{ width: 260, breakpoint: 'sm', collapsed: { desktop: true, mobile: !opened } }} padding="md">
      <AppShell.Header>
        <Container size="xl" h="100%">
          <Group h="100%" justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
              <Anchor component={Link} to="/" underline="never" c="dark">
                <Title order={3}>CalKing</Title>
              </Anchor>
              <Badge visibleFrom="xs" variant="light">Онлайн-запись</Badge>
            </Group>

            <Group visibleFrom="sm" gap="lg">
              <Anchor component={NavLink} to="/" underline="hover">Гость</Anchor>
              <Anchor component={NavLink} to="/owner" underline="hover">Владелец</Anchor>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Navbar py="md" px="md">
        <Anchor component={NavLink} to="/" onClick={close} underline="hover">Гостевое бронирование</Anchor>
        <Anchor component={NavLink} to="/owner" onClick={close} underline="hover" mt="md">Кабинет владельца</Anchor>
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="xl">
          <Routes>
            <Route path="/" element={<PublicBookingPage />} />
            <Route path="/owner" element={<OwnerDashboardPage />} />
          </Routes>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
