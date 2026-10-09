from injector import Module, provider, singleton

from config import AppConfig


class AppModule(Module):
    @singleton
    @provider
    def provide_config(self) -> AppConfig:
        return AppConfig.from_environment()
