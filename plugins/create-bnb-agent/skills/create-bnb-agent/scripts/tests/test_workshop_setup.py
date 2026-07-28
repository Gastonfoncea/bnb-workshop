import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).parents[1] / "workshop_setup.py"
SPEC = importlib.util.spec_from_file_location("workshop_setup", MODULE_PATH)
module = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(module)


class NameTests(unittest.TestCase):
    def test_sanitize_name_for_agentcore(self):
        self.assertEqual(module.sanitize_name("Wallet-Profiler_01"), "walletprofiler01")

    def test_sanitize_name_truncates_to_23_characters(self):
        value = module.sanitize_name("A very long wallet profiler name")
        self.assertTrue(value[0].isalpha())
        self.assertLessEqual(len(value), 23)
        self.assertTrue(value.isalnum())

    def test_sanitize_name_prefixes_non_letter(self):
        self.assertEqual(module.sanitize_name("123 Wallet"), "agent123wallet")

    def test_defaults_are_workshop_safe(self):
        self.assertEqual(module.DEFAULTS["price_u"], "0.1")
        self.assertEqual(module.DEFAULTS["network"], "bsc-testnet")
        self.assertEqual(module.DEFAULTS["destination"], "platform")
        self.assertEqual(module.DEFAULTS["storage"], "local")


class JsonTests(unittest.TestCase):
    def test_json_result_is_machine_readable(self):
        encoded = module.json_result({"ready": True})
        self.assertEqual(json.loads(encoded), {"ready": True})


class PreflightTests(unittest.TestCase):
    def test_preflight_accepts_supported_versions(self):
        result = module.evaluate_preflight(
            python_version=(3, 12, 0),
            node_version=(22, 0, 0),
            bag_version="bag 0.0.5",
            agentcore_help="--no-agent",
        )
        self.assertTrue(result["ready"])

    def test_preflight_rejects_wrong_agentcore_cli(self):
        result = module.evaluate_preflight(
            python_version=(3, 12, 0),
            node_version=(22, 0, 0),
            bag_version="bag 0.0.5",
            agentcore_help="starter toolkit",
        )
        self.assertFalse(result["ready"])
        self.assertIn("agentcore", result["missing"])

    def test_windows_prefers_cmd_wrapper(self):
        result = module.agentcore_command(
            "win32", {"agentcore.cmd": "X", "agentcore": "Y"}
        )
        self.assertEqual(result, "X")


class WorkspaceTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)

    def tearDown(self):
        self.temp.cleanup()

    def test_ensure_secret_creates_password_once(self):
        first = module.ensure_wallet_password(self.root)
        second = module.ensure_wallet_password(self.root)
        self.assertTrue(first["created"])
        self.assertFalse(second["created"])
        self.assertEqual(first["fingerprint"], second["fingerprint"])
        self.assertNotIn("value", first)

    def test_existing_keystore_without_password_is_blocked(self):
        wallets = self.root / ".studio" / "wallets"
        wallets.mkdir(parents=True)
        (wallets / "wallet.json").write_text("{}", encoding="utf-8")
        result = module.inspect_state(self.root)
        self.assertEqual(result["checkpoint"], "missing_existing_wallet_password")

    def test_studio_is_gitignored(self):
        module.ensure_wallet_password(self.root)
        self.assertIn(".studio/", (self.root / ".gitignore").read_text())

    def test_commands_never_execute_deploy(self):
        commands = module.project_commands("walletprofiler")
        flattened = " ".join(" ".join(command) for command in commands["execute"])
        self.assertNotIn("deploy agent", flattened)
        self.assertIn("bag deploy agent", commands["informational_next_steps"])


if __name__ == "__main__":
    unittest.main()
