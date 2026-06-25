import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(() => {
    controller = new AppController();
  });

  it('returns root health status', () => {
    expect(controller.getRootHealth()).toMatchObject({
      status: 'healthy',
      service: 'PhiloMind NestJS Backend',
    });
  });

  it('returns service health status', () => {
    expect(controller.getHealth()).toMatchObject({
      status: 'healthy',
    });
  });
});
